// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CaretDownIcon } from "@radix-ui/react-icons";
import { ContainerIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function useSelectArtifact(artifacts: string[]) {
  const router = useRouter();
  const [selectedArtifact, setSelectedArtifact] = useState(
    (router.query.artifact as string) || artifacts[0] || undefined,
  );

  return { selectedArtifact, setSelectedArtifact };
}
export function SimpleArtifactSelector({
  artifacts,
  onSelect,
  selectedArtifact,
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
  isReleaseSelector = false,
}: {
  artifacts: string[];
  unassignPossible?: boolean;
  isReleaseSelector?: boolean;
}) {
  const { selectedArtifact, setSelectedArtifact } =
    useSelectArtifact(artifacts);
  const router = useRouter();

  // add selected artifact to the url query params as ?artifact=artifactName

  useEffect(() => {
    if (selectedArtifact !== router.query.artifact)
      router.push({
        query: { ...router.query, artifact: selectedArtifact },
      });
  }, [selectedArtifact, router]);

  const handleSelect = (artifact?: string) => {
    setSelectedArtifact(artifact);
  };

  return (
    <SimpleArtifactSelector
      artifacts={artifacts}
      onSelect={handleSelect}
      isReleaseSelector={isReleaseSelector}
      selectedArtifact={selectedArtifact || ""}
    />
  );
}
