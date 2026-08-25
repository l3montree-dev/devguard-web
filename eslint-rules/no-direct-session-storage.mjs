// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

export default createRule({
  name: "no-direct-session-storage",
  meta: {
    type: "suggestion",
    docs: {
      description: "Reach sessionStorage through the useSessionStorage module",
    },
    schema: [],
    messages: {
      directSessionStorage:
        "`sessionStorage` reached directly. Use hook `useSessionStorage` from @/hooks/useSessionStorage.",
    },
  },
  defaultOptions: [],
  create(context) {
    // Matching the name rather than the global binding also catches
    // `window.sessionStorage` and `const ss = sessionStorage`.
    return {
      Identifier(node) {
        if (node.name !== "sessionStorage") return;
        context.report({ node, messageId: "directSessionStorage" });
      },
    };
  },
});
