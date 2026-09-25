// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

const CLASS_KEY = /^class(Name)?$|ClassName$/;
const CLASS_HELPERS = new Set([
  "classNames",
  "cn",
  "clsx",
  "cva",
  "twMerge",
  "twJoin",
]);
const SHADOW =
  /^(?:(?:inset-|drop-|text-)?shadow(?:-.+)?|\[(?:box|text)-shadow:.+\])$/;
const SHADOW_SUFFIX = /^(?:inset-|drop-|text-)?shadow-([^/[(]+)/;
const SHADOW_SIZES = new Set([
  "2xs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "inner",
  "none",
]);

// `hover:shadow-md!` -> `shadow-md`. A colon inside brackets is part of an
// arbitrary value or variant, not a variant separator.
function utilityOf(token) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    if (token[i] === "[") depth++;
    else if (token[i] === "]") depth--;
    else if (token[i] === ":" && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, "");
}

function isShadow(token) {
  const utility = utilityOf(token);
  return SHADOW.test(utility) && !utility.endsWith("-none");
}

// `shadow-primary/20`, as opposed to a size such as `shadow-lg`.
function isShadowColor(token) {
  const suffix = SHADOW_SUFFIX.exec(utilityOf(token))?.[1];
  return suffix !== undefined && !SHADOW_SIZES.has(suffix);
}

function inClassContext(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    if (node.type === "JSXAttribute") {
      return (
        node.name.type === "JSXIdentifier" && CLASS_KEY.test(node.name.name)
      );
    }
    if (
      node.type === "Property" &&
      node.key.type === "Identifier" &&
      CLASS_KEY.test(node.key.name)
    ) {
      return true;
    }
    if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      CLASS_HELPERS.has(node.callee.name)
    ) {
      return true;
    }
  }
  return false;
}

export default createRule({
  name: "no-shadow-class",
  meta: {
    type: "suggestion",
    docs: {
      description: "Discourage Tailwind shadow utilities on flat surfaces",
    },
    schema: [],
    messages: {
      shadowClass:
        "`{{classes}}` adds a shadow. Surfaces here are flat and separated by `border`, so drop it. A colored glow such as `shadow-primary/20` is fine, and a floating layer - a popover, tooltip or overlay - can disable this rule with a `--` reason.",
    },
  },
  defaultOptions: [],
  create(context) {
    function check(node, value) {
      const classes = value.split(/\s+/).filter(isShadow);
      if (classes.length === 0) return;
      // A colored shadow is a deliberate accent, not elevation.
      if (classes.some(isShadowColor)) return;
      if (!inClassContext(context.sourceCode.getAncestors(node))) return;
      context.report({
        node,
        messageId: "shadowClass",
        data: { classes: classes.join(" ") },
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
});
