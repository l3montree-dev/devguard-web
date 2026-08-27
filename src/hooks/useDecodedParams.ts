// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function useDecodedParams() {
  const params = useParams();
  const decodedParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(params || {}).map(([key, value]) => [
        key,
        decodeURIComponent(value as string),
      ]),
    );
  }, [params]);
  return decodedParams;
}
