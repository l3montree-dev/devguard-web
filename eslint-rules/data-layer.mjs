// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import ts from "typescript";
import { ESLintUtils } from "@typescript-eslint/utils";

// Shared by no-raw-fetch and no-data-fetching-in-view: both need to answer
// "is this call a transport call?", and a name match answers it badly - it
// misses `import { fetcher as f }` and trips over any local `fetcher` helper.
// https://typescript-eslint.io/developers/custom-rules/#typed-rules

// The transport primitives, by their *declared* name, so a renamed import still
// matches. `browserApiClient` is the sanctioned API client: calling it is fine
// in itself, it just may not happen straight from a view.
export const BARE_FETCHERS = new Set(["fetch", "fetcher"]);
export const ALL_TRANSPORTS = new Set([...BARE_FETCHERS, "browserApiClient"]);

// Where the real ones live (src/services/devGuardApi.ts, src/data-fetcher/fetcher.ts),
// so a same-named local helper is not mistaken for one.
const TRANSPORT_MODULES = /\/src\/(data-fetcher|services)\//;

const receiverPrefix = (callee) =>
  callee.object.type === "Identifier" ? `${callee.object.name}.` : "";

/**
 * Type services, or null when this file was linted without a program. Rules stay
 * usable in that case by falling back to the syntactic check.
 */
export const typeServices = (context) => {
  try {
    const services = ESLintUtils.getParserServices(context, true);
    return services.program ? services : null;
  } catch {
    return null;
  }
};

/** The declaration a callee resolves to, following import aliases. */
const resolveCallee = (services, callee) => {
  const checker = services.program.getTypeChecker();
  const tsNode = services.esTreeNodeToTSNodeMap.get(callee);
  if (!tsNode) return null;

  let symbol = checker.getSymbolAtLocation(tsNode);
  if (!symbol) return null;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    try {
      symbol = checker.getAliasedSymbol(symbol);
    } catch {
      // A broken import resolves to nothing useful; keep the local symbol.
    }
  }

  return {
    name: symbol.getName(),
    files: (symbol.declarations ?? []).map((d) => d.getSourceFile().fileName),
  };
};

// SWR caches reads. Suggesting it for a POST would be wrong advice, and both
// transports take a RequestInit as their second argument.
const READ_METHODS = new Set(["GET", "HEAD"]);

/** True when the call passes a non-GET `method`, i.e. it writes rather than reads. */
export const isMutation = (node) => {
  const init = node.arguments[1];
  if (init?.type !== "ObjectExpression") return false;

  for (const property of init.properties) {
    if (property.type !== "Property" || property.computed) continue;
    const key =
      property.key.type === "Identifier"
        ? property.key.name
        : property.key.type === "Literal"
          ? property.key.value
          : null;
    if (key !== "method") continue;
    // A computed method (`method: verb`) is unknowable, so assume it writes.
    if (property.value.type !== "Literal") return true;
    return !READ_METHODS.has(String(property.value.value).toUpperCase());
  }

  return false;
};

/**
 * The name a *call* would be reported under, or null when it is not one of
 * `names`. Only the callee is inspected, so passing a transport as a reference -
 * `useSWR(url, fetcher)` - is never a hit.
 */
export const transportName = (services, node, names) => {
  const { callee } = node;

  if (services) {
    // `window.fetch(...)` resolves through the property, plain `fetch(...)`
    // through the identifier.
    const target =
      callee.type === "MemberExpression" && !callee.computed
        ? callee.property
        : callee;
    if (target.type !== "Identifier") return null;

    const resolved = resolveCallee(services, target);
    if (!resolved || !names.has(resolved.name)) return null;

    // The global fetch is declared in a lib.*.d.ts; ours live under src.
    const isTransport = resolved.files.some(
      (file) =>
        TRANSPORT_MODULES.test(file) || /\/lib\.[^/]*\.d\.ts$/.test(file),
    );
    if (!isTransport) return null;

    return callee.type === "MemberExpression"
      ? `${receiverPrefix(callee)}${resolved.name}`
      : resolved.name;
  }

  // Untyped fallback: match the bare names only.
  if (callee.type === "Identifier" && names.has(callee.name))
    return callee.name;
  return null;
};

/**
 * True when the callee is an SWR *reading* hook, whatever it was imported as.
 * swr also exports `mutate`, which invalidates the cache rather than fetching,
 * so the call has to look like a hook too - rules-of-hooks already guarantees a
 * hook is called by a `use*` name, which is what makes this safe.
 */
export const isSwrHook = (services, node) => {
  const { callee } = node;
  if (callee.type !== "Identifier") return false;
  if (!/^use/.test(callee.name)) return false;

  if (services) {
    const resolved = resolveCallee(services, callee);
    if (!resolved) return /^useSWR/.test(callee.name);
    return resolved.files.some((file) => /\/node_modules\/swr\//.test(file));
  }

  return /^useSWR/.test(callee.name);
};
