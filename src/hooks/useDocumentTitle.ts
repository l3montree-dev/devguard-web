// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useEffect } from "react";

export default function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
