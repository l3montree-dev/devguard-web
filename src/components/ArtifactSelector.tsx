// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CaretDownIcon } from "@radix-ui/react-icons";
import { ContainerIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useRouterQuery from "../hooks/useRouterQuery";

export function useSelectArtifact(
  unassignPossible: boolean,
  artifacts: string[],
) {
  const searchParams = useSearchParams();

  const [selectedArtifact, setSelectedArtifact] = useState(
    searchParams?.get("artifact") ||
      (unassignPossible ? undefined : artifacts[0]),
  );

  return { selectedArtifact, setSelectedArtifact };
}
export function SimpleArtifactSelector({
  artifacts,
  onSelect,
  selectedArtifact,
  unassignPossible = false,
  isReleaseSelector = false,
}: {
  artifacts: string[];
  onSelect: (artifact: string | undefined) => void;
  selectedArtifact?: string;
  unassignPossible?: boolean;
  isReleaseSelector?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className="flex w-52 items-center justify-between h-4">
            {isReleaseSelector && (
              <ContainerIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-ellipsis text-left block flex-1 overflow-hidden">
              {selectedArtifact || "Select Artifact"}
            </span>
            <CaretDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-50 max-h-[500px] overflow-y-auto w-80"
      >
        {unassignPossible && (
          <DropdownMenuCheckboxItem
            key="unassign"
            checked={!selectedArtifact}
            onClick={() => {
              onSelect(undefined);
            }}
          >
            <span className="text-muted-foreground">Clear selection</span>
          </DropdownMenuCheckboxItem>
        )}
        {artifacts.sort().map((artifact) => (
          <DropdownMenuCheckboxItem
            key={artifact}
            checked={artifact === selectedArtifact}
            onClick={() => {
              //check if artifact is already selected
              if (artifact === selectedArtifact) {
                return;
              }
              onSelect(artifact);
            }}
          >
            {artifact === "" ? "Default" : artifact}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function QueryArtifactSelector({
  artifacts,
  unassignPossible = false,
  isReleaseSelector = false,
}: {
  artifacts: string[];
  unassignPossible?: boolean;
  isReleaseSelector?: boolean;
}) {
  const { selectedArtifact, setSelectedArtifact } = useSelectArtifact(
    unassignPossible,
    artifacts,
  );
  const pushQueryParameter = useRouterQuery();

  // add selected artifact to the url query params as ?artifact=artifactName

  const handleSelect = (artifact?: string) => {
    pushQueryParameter({
      artifact,
    });

    setSelectedArtifact(artifact);
  };

  return (
    <SimpleArtifactSelector
      artifacts={artifacts}
      onSelect={handleSelect}
      unassignPossible={unassignPossible}
      isReleaseSelector={isReleaseSelector}
      selectedArtifact={selectedArtifact}
    />
  );
}
