import { ArtifactDTO, InformationSources } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FunctionComponent, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "../ui/checkbox";

interface Props {
  artifact: ArtifactDTO;
  index: number;
  rootNodes: InformationSources[];
  hasSession: boolean;
  selectedSourceUrls: Set<string>;
  onToggleSource: (url: string) => void;
  onToggleAllSources: (urls: string[]) => void;
  onEdit: () => void;
  onSync: () => void;
  onDelete: () => void;
}

const trimOriginUrl = (url: string): string => {
  // Remove "sbom:" prefix if it exists
  let trimmedUrl = url.startsWith("sbom:") ? url.substring(5) : url;

  // Extract the part before @ if it exists
  const atIndex = trimmedUrl.indexOf("@");
  return atIndex !== -1 ? trimmedUrl.substring(0, atIndex) : trimmedUrl;
};

const ArtifactRow: FunctionComponent<Props> = ({
  artifact,
  index,
  rootNodes,
  hasSession,
  selectedSourceUrls,
  onToggleSource,
  onToggleAllSources,
  onEdit,
  onSync,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasUpstreamUrls = rootNodes && rootNodes.length > 0;

  // Track selection state for this artifact's sources
  const sourceUrls = rootNodes.map((node) => node.url);
  const allSelected =
    hasUpstreamUrls &&
    sourceUrls.length > 0 &&
    sourceUrls.every((url) => selectedSourceUrls.has(url));
  const someSelected =
    hasUpstreamUrls && sourceUrls.some((url) => selectedSourceUrls.has(url));

  return (
    <>
      {/* Artifact name row - clickable to expand/collapse */}
      <tr
        className={classNames(
          "cursor-pointer hover:bg-muted/50 border-b",
          index % 2 !== 0 && "bg-card/50",
        )}
        onClick={(e) => {
          // Don't toggle if clicking on checkbox
          if (
            (e.target as HTMLElement).closest(
              'button, input, [role="checkbox"]',
            )
          )
            return;
          hasUpstreamUrls && setIsExpanded((prev) => !prev);
        }}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {hasUpstreamUrls ? (
              isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )
            ) : (
              <div className="w-4 h-4 flex-shrink-0" />
            )}
            {hasSession && hasUpstreamUrls && (
              <div onClick={(e) => e.stopPropagation()} className="pt-1">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={() => onToggleAllSources(sourceUrls)}
                  disabled={!hasSession}
                />
              </div>
            )}
            <span className="font-medium">{artifact.artifactName}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          {hasUpstreamUrls ? (
            <Badge variant="outline" className="w-fit">
              {rootNodes.length} source{rootNodes.length !== 1 ? "s" : ""}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">
              No SBOM data yet
            </span>
          )}
        </td>
        {hasSession && (
          <td
            className="py-3 px-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="artifact-options" asChild>
                <Button variant="ghost" size={"icon"}>
                  <EllipsisHorizontalIcon className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onSync}>
                  Sync SBOM URLs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>
                  <span className="text-destructive">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        )}
      </tr>

      {/* SBOM Sources/Origins - shown when expanded */}
      {isExpanded &&
        hasUpstreamUrls &&
        rootNodes.map((node, nodeIndex) => (
          <tr
            key={node.url}
            className={classNames(
              "border-b border-gray-100 dark:border-white/5 hover:bg-muted/30",
              nodeIndex === rootNodes.length - 1 ? "" : "",
            )}
          >
            <td className="py-3 pl-10 pr-4" colSpan={hasSession ? 3 : 2}>
              <div className="flex items-start gap-3">
                {hasSession && (
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedSourceUrls.has(node.url)}
                      onCheckedChange={() => onToggleSource(node.url)}
                      disabled={!hasSession}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs pt-0.5">
                      {trimOriginUrl(node.url)}
                    </span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        ))}
    </>
  );
};

export default ArtifactRow;
