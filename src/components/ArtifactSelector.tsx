// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CaretDownIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ArtifactSelector({ artifacts }: { artifacts: string[] }) {
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
        {artifacts.sort().map((artifact) => (
          <DropdownMenuCheckboxItem
            key={artifact}
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
            {artifact === "" ? "Default" : artifact}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
