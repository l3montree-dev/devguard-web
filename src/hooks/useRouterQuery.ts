// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

const pushQuery = (
  newQuery: Record<string, string | number | boolean | undefined | null>,
) => {
  const newSearchParams = new URLSearchParams(window.location.search);
  Object.entries(newQuery).forEach(([k, v]) => {
    if (v === undefined || v === null) {
      newSearchParams.delete(k);
    } else {
      newSearchParams.set(k, String(v));
    }
  });
  const query = newSearchParams.toString();
  window.history.replaceState(
    null,
    "",
    query ? "?" + query : window.location.pathname,
  );
};

const useRouterQuery = () => pushQuery;

export default useRouterQuery;
