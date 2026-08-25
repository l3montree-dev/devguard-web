// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

export default createRule({
  name: "no-direct-local-storage",
  meta: {
    type: "suggestion",
    docs: {
      description: "Reach localStorage through the useLocalStorage module",
    },
    schema: [],
    messages: {
      directLocalStorage:
        "`localStorage` reached directly. Use hook `useLocalStorage` from @/hooks/useLocalStorage.",
    },
  },
  defaultOptions: [],
  create(context) {
    // Matching the name rather than the global binding also catches
    // `window.localStorage` and `const ls = localStorage`.
    return {
      Identifier(node) {
        if (node.name !== "localStorage") return;
        context.report({ node, messageId: "directLocalStorage" });
      },
    };
  },
});
