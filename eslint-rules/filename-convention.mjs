// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import path from "node:path";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

// The convention, by what a file exports rather than by its extension: a
// component file is PascalCase (RiskScannerDialog.tsx), a hook file is named
// after its hook (useHelpCenter.ts), everything else is camelCase
// (dependencyGraphHelpers.ts).
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const CAMEL_CASE = /^[a-z][A-Za-z0-9]*$/;
const HOOK_NAME = /^use[A-Z][A-Za-z0-9]*$/;

// Next.js owns these names - the framework resolves them, so they are not ours
// to rename. Same for the `[...slug]` dynamic segments.
const FRAMEWORK_NAMES = new Set([
  "page",
  "layout",
  "route",
  "loading",
  "error",
  "not-found",
  "global-error",
  "template",
  "default",
  "middleware",
  "proxy",
  "instrumentation",
  "instrumentation-client",
  "sitemap",
  "robots",
  "opengraph-image",
  "icon",
  "apple-icon",
  "index",
]);

const hasDefaultExport = (program) =>
  program.body.some(
    (node) => node.type === AST_NODE_TYPES.ExportDefaultDeclaration,
  );

const exportedNames = (program) => {
  const names = [];
  for (const node of program.body) {
    if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      const d = node.declaration;
      if (d.type === AST_NODE_TYPES.Identifier) names.push(d.name);
      else if (d.id?.name) names.push(d.id.name);
      continue;
    }
    if (node.type !== AST_NODE_TYPES.ExportNamedDeclaration) continue;
    const d = node.declaration;
    if (!d) continue;
    if (d.id?.name) names.push(d.id.name);
    if (d.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const decl of d.declarations) {
        if (decl.id.type === AST_NODE_TYPES.Identifier)
          names.push(decl.id.name);
      }
    }
  }
  return names;
};

export default createRule({
  name: "filename-convention",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "File names follow the export they contain: PascalCase for components, useXxx for hooks, camelCase otherwise",
    },
    schema: [],
    messages: {
      component:
        "`{{base}}` exports the component `{{name}}`, so the file should be PascalCase (`{{name}}{{ext}}`).",
      hook: "`{{base}}` only exports hooks, so the file name should start with `use` (e.g. `{{name}}{{ext}}`).",
      module:
        "`{{base}}` is not a component, so the file should be camelCase (e.g. `dependencyGraphHelpers{{ext}}`).",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const filename = context.filename ?? context.getFilename();
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);

        if (FRAMEWORK_NAMES.has(base)) return;
        if (base.startsWith("[")) return;
        if (base.endsWith(".test") || base.endsWith(".d")) return;
        if (base.endsWith(".config")) return;

        const names = exportedNames(program);

        // A PascalCase export in a .tsx file is a component by convention, and
        // it wins over any hook the same file happens to expose - a context
        // file exports both a Provider and a `useX`, and is named for neither.
        // A default export can be anonymous (`export default forwardRef(...)`),
        // so its presence counts even when no name is recoverable.
        const component =
          ext === ".tsx" &&
          (names.find((n) => PASCAL_CASE.test(n)) ??
            (hasDefaultExport(program) ? base : undefined));
        if (component) {
          if (!PASCAL_CASE.test(base)) {
            context.report({
              node: program,
              messageId: "component",
              data: { base: base + ext, name: component, ext },
            });
          }
          return;
        }

        // Only a file that exports nothing but hooks has to be named like one.
        const hooks = names.filter((n) => HOOK_NAME.test(n));
        if (hooks.length > 0 && hooks.length === names.length) {
          if (!HOOK_NAME.test(base)) {
            context.report({
              node: program,
              messageId: "hook",
              data: { base: base + ext, name: hooks[0], ext },
            });
          }
          return;
        }

        if (!CAMEL_CASE.test(base)) {
          context.report({
            node: program,
            messageId: "module",
            data: { base: base + ext, ext },
          });
        }
      },
    };
  },
});
