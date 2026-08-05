"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DependencyVulnHints } from "@/types/api/api";
import { SpeakerXMarkIcon, StopIcon } from "@heroicons/react/24/outline";
import { Bug, CheckCircleIcon } from "lucide-react";
import type { FunctionComponent } from "react";
import useSWR from "swr";
import { fetcher } from "../../data-fetcher/fetcher";

interface ManagementDecisionsProps {
  // Base dependency-vuln URI; the hints are fetched from `${uri}/hints`.
  uri: string;
}

const ManagementDecisions: FunctionComponent<ManagementDecisionsProps> = ({
  uri,
}) => {
  const { data: hints } = useSWR<DependencyVulnHints>(uri + "/hints", fetcher);

  return (
    <div className="p-5">
      <h3 className="mb-2 text-xs font-semibold">
        Management decisions across the organization
      </h3>
      {hints ? (
        <div className="flex flex-row justify-between mt-4">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"secondary"}>
                <Bug className="-ml-1 mr-1 inline-block h-4 w-4" />
                {hints.amountOpen}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-screen-sm font-normal">
              This vulnerability is still open in {hints.amountOpen} projects,
              artifacts and assets.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"secondary"}>
                <CheckCircleIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                {hints.amountFixed}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-screen-sm font-normal">
              This vulnerability has been fixed in {hints.amountFixed} projects,
              artifacts and assets.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"secondary"}>
                <SpeakerXMarkIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                {hints.amountAccepted}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-screen-sm font-normal">
              This vulnerability has been accepted in {hints.amountAccepted}{" "}
              projects, artifacts and assets.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"secondary"}>
                <StopIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                {hints.amountFalsePositive}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-screen-sm font-normal">
              This vulnerability has been marked as false positive in{" "}
              {hints.amountFalsePositive} projects, artifacts and assets.
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <Skeleton className="w-full h-20" />
      )}
    </div>
  );
};

export default ManagementDecisions;
