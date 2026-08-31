// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { SimpleArtifactSelector } from "@/components/ArtifactSelector";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TagIcon } from "@heroicons/react/24/outline";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { GitBranchIcon } from "lucide-react";
import type { FunctionComponent } from "react";
import { classNames } from "../../../utils/common";
import { BranchTagSelector } from "../../BranchTagSelector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import type { ManualUploadOptions } from "@/types/view/integration";

interface Props {
  options: ManualUploadOptions;
  originLabel: string;
  originHint: string;
  showArtifact: boolean;
}

const ManualUploadOptionsFields: FunctionComponent<Props> = ({
  options,
  originLabel,
  originHint,
  showArtifact,
}) => {
  const {
    branches,
    tags,
    branchOrTagName,
    onBranchOrTagChange,
    isTag,
    onIsTagChange,
    artifactName,
    onArtifactNameChange,
    artifacts,
    selectedArtifact,
    onSelectedArtifactChange,
    origin,
    onOriginChange,
    onReInit,
  } = options;

  if (branches.length === 0 && tags.length === 0) {
    return (
      <Collapsible className="w-full" onOpenChange={onReInit}>
        <CollapsibleTrigger className="text-muted-foreground flex flex-row justify-between w-full mt-4 pb-2 cursor-pointer text-sm">
          More Options
          <CaretDownIcon className="ml-2 inline-block h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex w-full border-t pt-4 flex-row gap-2">
            <div className="w-full">
              <Label className="mb-2 block">Branch/Tag Name</Label>
              <Input
                value={branchOrTagName}
                onChange={(e) =>
                  onBranchOrTagChange(e.target.value, e.target.value, isTag)
                }
                placeholder="Enter branch or tag name"
              />
              <div className="flex items-center mt-2 gap-1 flex-row">
                <ToggleGroup className="w-full" type="single">
                  <ToggleGroupItem
                    className="w-full cursor-pointer justify-start"
                    variant="outline"
                    value="branch"
                  >
                    <button
                      className={classNames(
                        "p-1 rounded",
                        isTag ? "" : "border bg-card",
                      )}
                      onClick={() => onIsTagChange(false)}
                    >
                      <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span>Branch</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    className="w-full cursor-pointer justify-start"
                    variant="outline"
                    value="tag"
                  >
                    <button
                      className={classNames(
                        "p-1 rounded",
                        isTag ? "border bg-card" : "",
                      )}
                      onClick={() => onIsTagChange(true)}
                    >
                      <TagIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span>Tag</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            {showArtifact && (
              <div className="w-full">
                <Label className="mb-2 block">Artifact</Label>
                <Input
                  value={artifactName}
                  onChange={(e) => onArtifactNameChange(e.target.value)}
                  placeholder="Artifact name"
                />
              </div>
            )}
            <div className="w-full">
              <Label className="mb-2 block">{originLabel}</Label>
              <Input
                value={origin}
                onChange={(e) => onOriginChange(e.target.value)}
                placeholder="Origin"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="mt-4 flex flex-row gap-2">
      <div>
        <BranchTagSelector
          branches={branches}
          tags={tags}
          disableNavigateToRefInsteadCall={(v) =>
            onBranchOrTagChange(v.name, v.slug, v.type === "tag")
          }
        />
      </div>
      {showArtifact && (
        <SimpleArtifactSelector
          artifacts={artifacts?.map((a) => a.artifactName) || []}
          selectedArtifact={selectedArtifact}
          onSelect={onSelectedArtifactChange}
        />
      )}
      <div className="w-full">
        <Input
          variant="onCard"
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          placeholder="Origin"
        />
        <span className="text-muted-foreground text-xs">{originHint}</span>
      </div>
    </div>
  );
};

export default ManualUploadOptionsFields;
