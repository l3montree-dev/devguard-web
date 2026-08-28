// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ESLintUtils } from "@typescript-eslint/utils";
import {
  ALL_TRANSPORTS,
  isSwrHook,
  transportName,
  typeServices,
} from "./data-layer.mjs";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.devguard.org/lint/${name}`,
);

export default createRule({
  name: "no-data-fetching-in-view",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Keep data fetching out of App Router pages and components - it belongs in a service or a hook",
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      swrInView:
        "`{{name}}(...)` fetches data inside a view. Extract the SWR key, fetcher and response shaping into a hook in src/hooks/** (e.g. `useSomething()`) or a function in src/services/**, and let this file consume the result.",
      transportInView:
        "`{{name}}(...)` calls the API straight from a view. Wrap it in SWR and move it into src/hooks/** or src/services/**, so this file only consumes the result.",
    },
  },
  defaultOptions: [],
  create(context) {
    // SWR hooks are resolved against node_modules/swr, so `import
    // useSWRImmutable from "swr/immutable"` counts however it was renamed on the
    // way in. Only *calls* are inspected, so `useSWR(url, fetcher)` passing the
    // fetcher as a reference is never reported.
    const services = typeServices(context);

    return {
      CallExpression(node) {
        if (isSwrHook(services, node)) {
          context.report({
            node,
            messageId: "swrInView",
            data: { name: context.sourceCode.getText(node.callee) },
          });
          return;
        }

        // apiFetch/adminFetch are allowed in general, but not straight from a
        // view - hence ALL_TRANSPORTS here where no-raw-fetch uses BARE_FETCHERS.
        const name = transportName(services, node, ALL_TRANSPORTS);
        if (!name) return;
        context.report({ node, messageId: "transportInView", data: { name } });
      },
    };
  },
});
