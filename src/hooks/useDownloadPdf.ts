// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import { toast } from "@/lib/toast";

// basePath is the directory the report lives in, so callers one level below it
// pass `${pathname}/..`.
export function useDownloadPdf(
  basePath: string,
  fileType: string,
  errorLabel: string,
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (artifact?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${basePath}/${fileType}?${new URLSearchParams({ artifact: artifact || "" })}`,
        {
          signal: AbortSignal.timeout(60 * 8 * 1000),
          method: "GET",
        },
      );
      if (!response.ok) {
        toast.error(
          `Failed to download ${errorLabel}. Please try again later.`,
        );
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileType;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error(`Failed to download ${errorLabel}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleDownload };
}
