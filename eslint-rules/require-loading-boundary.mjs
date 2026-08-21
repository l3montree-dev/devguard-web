// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import fs from "node:fs";
import path from "node:path";

// A loading.tsx wraps its layout's children slot, so it covers every nested
// segment too - a page only needs one at or above its own directory.
const hasLoadingBoundary = (pageDir) => {
  let dir = pageDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, "loading.tsx"))) return true;
    if (dir.split(path.sep).slice(-2).join("/") === "src/app") return false;
    const parent = path.dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
};

const requireLoadingBoundary = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require a loading.tsx boundary at or above every App Router page",
    },
    schema: [],
    messages: {
      missing:
        "No loading.tsx in this segment or any ancestor, so navigating here has no loading UI. Add a loading.tsx next to this page, or disable this rule at the top of the file with a `--` reason (e.g. the page owns its own <Suspense>, or it only redirects).",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (path.basename(filename) !== "page.tsx") return {};
    if (!filename.split(path.sep).join("/").includes("/src/app/")) return {};

    return {
      Program(node) {
        if (hasLoadingBoundary(path.dirname(filename))) return;
        context.report({ node, messageId: "missing" });
      },
    };
  },
};

export default requireLoadingBoundary;
