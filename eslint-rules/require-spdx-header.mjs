// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

// The repo standard is a single SPDX tag rather than the old copyright block.
// https://spdx.org/licenses/AGPL-3.0-or-later.html
const SPDX_TAG = /SPDX-License-Identifier:\s*(\S+)/;
const EXPECTED = "AGPL-3.0-or-later";

export default createRule({
  name: "require-spdx-header",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require an `SPDX-License-Identifier: AGPL-3.0-or-later` header in every file",
    },
    // Insert only. Rewriting a license someone deliberately declared is a
    // decision for a person, so `wrongLicense` stays unfixable.
    fixable: "code",
    schema: [],
    messages: {
      missing:
        "Missing license header. Add `// SPDX-License-Identifier: AGPL-3.0-or-later` in the first lines of this file.",
      wrongLicense:
        "License header says `{{found}}`, but this repo is licensed {{expected}}. Change the header to `// SPDX-License-Identifier: AGPL-3.0-or-later`.",
    },
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;

    // A header sits above the code, so only comments before the first
    // statement count - an SPDX tag in a doc block halfway down does not.
    const headerComments = () => {
      const comments = sourceCode.getAllComments();
      const first = sourceCode.ast.body[0];
      if (!first) return comments;
      return comments.filter((comment) => comment.range[1] <= first.range[0]);
    };

    return {
      Program(node) {
        // An empty file has nothing to license.
        if (sourceCode.getText().trim() === "") return;

        for (const comment of headerComments()) {
          const match = SPDX_TAG.exec(comment.value);
          if (!match) continue;
          if (match[1] === EXPECTED) return;
          context.report({
            loc: comment.loc,
            messageId: "wrongLicense",
            data: { found: match[1], expected: EXPECTED },
          });
          return;
        }

        context.report({
          node,
          messageId: "missing",
          fix(fixer) {
            const text = sourceCode.getText();
            const header = `// Copyright ${new Date().getFullYear()} L3montree GmbH and the DevGuard Contributors.\n// SPDX-License-Identifier: \t${EXPECTED}\n`;
            // A shebang has to stay on line one; a "use client" directive does
            // not, because comments may precede it.
            if (!text.startsWith("#!")) {
              return fixer.insertTextBeforeRange([0, 0], `${header}\n`);
            }
            const eol = text.indexOf("\n");
            return fixer.insertTextAfterRange([0, eol + 1], `${header}\n`);
          },
        });
      },
    };
  },
});
