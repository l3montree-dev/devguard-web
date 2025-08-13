// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/router";
import { CaretDownIcon } from "@radix-ui/react-icons";

export function ArtifactSelector({ artifacts }: { artifacts: any[] }) {
  const router = useRouter();
  const [selectedArtifact, setSelectedArtifact] = useState(
    (router.query.artifact as string) || "",
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className="flex w-52 items-center justify-between h-4">
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
        {artifacts.map((artifact) => (
          <DropdownMenuCheckboxItem
            key={artifact.id}
            checked={artifact === selectedArtifact}
            onClick={() => {
              //check if artifact is already selected
              if (artifact === selectedArtifact) {
                setSelectedArtifact("");
                router.push({
                  query: { ...router.query, artifact: "" },
                });
                return;
              }
              setSelectedArtifact(artifact);
              router.push({
                query: { ...router.query, artifact: artifact },
              });
            }}
          >
            {artifact}{" "}
            <span className="text-xs text-gray-500">{artifact.value}</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
