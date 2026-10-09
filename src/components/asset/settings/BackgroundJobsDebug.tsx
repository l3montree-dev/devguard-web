// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetScope } from "@/hooks/useAssetScope";
import { toast } from "@/lib/toast";
import { triggerAssetPipeline } from "@/services/assetService";
import { formatDateTime } from "@/utils/format";

const BackgroundJobsDebug = () => {
  const asset = useActiveAsset()!;
  const scope = useAssetScope();

  const handleTrigger = async () => {
    try {
      await triggerAssetPipeline(scope);
      toast.success("Background jobs triggered");
    } catch (error) {
      console.error("Failed to trigger background jobs:", error);
      toast.error("Failed to trigger background jobs");
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="mt-4 w-full cursor-pointer rounded-md px-4 py-2 text-right text-xs font-medium text-muted-foreground">
        Debug
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Button onClick={handleTrigger} variant="outline">
          Trigger Background jobs
        </Button>
        <small className="mt-4 block text-muted-foreground">
          Last Run: {formatDateTime(asset.pipelineLastRun)}
        </small>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BackgroundJobsDebug;
