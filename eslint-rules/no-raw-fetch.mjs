// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";
import {
  BARE_FETCHERS,
  isMutation,
  transportName,
  typeServices,
} from "./data-layer.mjs";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

export default createRule({
  name: "no-raw-fetch",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Discourage bare fetch and fetcher reads outside the data layer",
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      rawFetch:
        "`{{name}}(...)` reads by hand, so the result is not cached, deduped or revalidated. Read it with `useSWR` instead, or move the call into src/services/** or src/data-fetcher/**. A server side load can disable this rule with a `--` reason.",
    },
  },
  defaultOptions: [],
  create(context) {
    // Resolving the callee through the type checker means a renamed import
    // (`import { fetcher as f }`) is still caught and a local helper that
    // happens to be called `fetcher` is not. `browserApiClient` is deliberately
    // absent: it is the sanctioned client, so calling it is not the problem.
    // Where it may not be called - straight from a view - is
    // local/no-data-fetching-in-view's business.
    const services = typeServices(context);

    return {
      CallExpression(node) {
        const name = transportName(services, node, BARE_FETCHERS);
        if (!name) return;
        // A write has nothing to cache, so SWR is not the answer for it.
        if (isMutation(node)) return;
        context.report({ node, messageId: "rawFetch", data: { name } });
      },
    };
  },
});
