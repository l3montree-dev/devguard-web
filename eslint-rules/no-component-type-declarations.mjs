// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

// Types declared in a function body cannot be reused or imported, so they
// belong in src/types/** (see src/types/view/helpcenter.ts).
const FUNCTION_TYPES = new Set([
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
]);

const ownerName = (fn) => {
  if (fn.id?.name) return fn.id.name;
  const parent = fn.parent;
  if (
    parent?.type === AST_NODE_TYPES.VariableDeclarator &&
    parent.id.type === AST_NODE_TYPES.Identifier
  ) {
    return parent.id.name;
  }
  if (
    (parent?.type === AST_NODE_TYPES.Property ||
      parent?.type === AST_NODE_TYPES.MethodDefinition) &&
    parent.key.type === AST_NODE_TYPES.Identifier
  ) {
    return parent.key.name;
  }
  return "an anonymous function";
};

export default createRule({
  name: "no-component-type-declarations",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow type and interface declarations inside a function or component body",
    },
    schema: [],
    messages: {
      inFunction:
        "`{{kind}} {{name}}` is declared inside `{{owner}}`. Move it to a types file under src/types/** (e.g. src/types/view/<feature>.ts) and import it here.",
    },
  },
  defaultOptions: [],
  create(context) {
    // Only a declaration *nested in* a function is a problem - a top level
    // `type` next to the component it describes is exactly right.
    const enclosingFunction = (node) => {
      for (let current = node.parent; current; current = current.parent) {
        if (FUNCTION_TYPES.has(current.type)) return current;
      }
      return null;
    };

    const check = (kind) => (node) => {
      const fn = enclosingFunction(node);
      if (!fn) return;
      context.report({
        node: node.id,
        messageId: "inFunction",
        data: { kind, name: node.id.name, owner: ownerName(fn) },
      });
    };

    return {
      TSTypeAliasDeclaration: check("type"),
      TSInterfaceDeclaration: check("interface"),
    };
  },
});
