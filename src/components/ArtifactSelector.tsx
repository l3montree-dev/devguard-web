// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { ContainerIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUpdateAssetVersionState } from "../context/AssetVersionContext";
import useDecodedParams from "../hooks/useDecodedParams";
import useRouterQuery from "../hooks/useRouterQuery";
import { browserApiClient } from "../services/devGuardApi";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import Link from "next/link";

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
  const [filter, setFilter] = useState("");

  const filteredArtifacts = useMemo(() => {
    artifacts.sort((a, b) => a.localeCompare(b));

    return artifacts.filter((a) => a.includes(filter));
  }, [artifacts, filter]);

  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug?: string;
  };

  const updateAssetVersion = useUpdateAssetVersionState();

  const handleArtifactCreation = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!params.assetVersionSlug) {
      toast.error("Asset version is not selected.");
      return;
    }

    const resp = await browserApiClient(
      `/organizations/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${params.assetVersionSlug}/artifacts/`,
      {
        method: "POST",
        body: JSON.stringify({
          artifactName: filter,
          upstreamUrls: [],
        }),
      },
    );
    if (!resp.ok) {
      toast.error("Failed to create artifact: " + resp.statusText);
      return;
    }

    const newArtifact = await resp.json();
    updateAssetVersion((prev) => ({
      ...prev!,
      artifacts: [...prev!.artifacts, newArtifact],
    }));
    toast.success("Artifact created successfully");
    onSelect(filter);
    setFilter("");
  };

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
        <Input
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2"
        />
        {unassignPossible && (
          <DropdownMenuCheckboxItem
            key="unassign"
            checked={selectedArtifact === undefined}
            onClick={() => {
              onSelect(undefined);
            }}
          >
            <span className="text-muted-foreground">Clear selection</span>
          </DropdownMenuCheckboxItem>
        )}
        {filteredArtifacts.length === 0 && filter.length > 0 && (
          <DropdownMenuItem
            onClick={handleArtifactCreation}
            className="bg-card cursor-pointer mt-2 border flex flex-row justify-between font-medium"
          >
            Create artifact {filter}
            <PlusCircleIcon className="w-5 h-5 text-muted-foreground" />
          </DropdownMenuItem>
        )}
        {filteredArtifacts.map((artifact) => (
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
        <Link
          href={`/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${params.assetVersionSlug}/artifacts`}
        >
          <DropdownMenuItem className="text-sm text-foreground block font-medium text-center w-full">
            View all artifacts
          </DropdownMenuItem>
        </Link>
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
