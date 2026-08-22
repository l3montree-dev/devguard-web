// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useEffect } from "react";

export default function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const anchor = window.location.hash.replace(/^#/, "");
      if (!anchor) return;

      document.getElementById(anchor)?.scrollIntoView();
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
}
