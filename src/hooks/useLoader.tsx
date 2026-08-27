// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Loader2 } from "lucide-react";
import { useState } from "react";

export function useLoader() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    waitFor<Params, T>(
      fn: ((params?: Params) => Promise<T>) | Promise<T>,
    ): (params?: Params) => Promise<T> {
      return async (params?: Params) => {
        try {
          setIsLoading(true);
          let res: T;
          if (typeof fn === "function") {
            res = await fn(params);
            setIsLoading(false);
          } else {
            res = await fn;
            setIsLoading(false);
          }
          return res;
        } catch (e) {
          setIsLoading(false);
          throw e;
        }
      };
    },
    isLoading,
    Loader: () => {
      return isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null;
    },
  };
}
