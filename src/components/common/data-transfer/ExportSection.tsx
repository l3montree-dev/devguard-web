// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { readErrorMessage } from "@/services/apiClient";
import { exportArchive } from "@/services/dataTransferService";
import { type FunctionComponent, useState } from "react";

interface Props {
  title: string;
  description: string;
  // api path of the exported org, project or asset
  resourcePath: string;
}

const ExportSection: FunctionComponent<Props> = ({
  title,
  description,
  resourcePath,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const resp = await exportArchive(resourcePath);
      if (!resp.ok) {
        toast.error(
          "Export has not been successful. Reason: " +
            (await readErrorMessage(resp)),
        );
        return;
      }
      const url = URL.createObjectURL(await resp.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "devguard-export.tar";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export has not been successful");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ListItem
      Title={title}
      Description={description}
      Button={
        <Button
          variant="outline"
          onClick={handleExport}
          isSubmitting={isExporting}
        >
          Export
        </Button>
      }
    />
  );
};

export default ExportSection;
