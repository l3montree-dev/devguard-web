// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useRootNodes } from "@/context/AssetVersionContext";
import { CaretDownIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import useRouterQuery from "../hooks/useRouterQuery";

function getRootNodeName(url?: string | null): string {
  return url?.trim().split("@")[0] ?? "";
}

export default function RootNodeSelector() {
  const { rootNodes } = useRootNodes();
  const searchParams = useSearchParams();
  const pushQueryParameter = useRouterQuery();

  const [open, setOpen] = useState(false);

  const artifactName = searchParams?.get("artifact") ?? "";
  const rootNodeParam = searchParams?.get("origin");

  const [selectedRootNode, setSelectedRootNode] = useState(
    getRootNodeName(rootNodeParam),
  );

  useEffect(() => {
    setSelectedRootNode(getRootNodeName(rootNodeParam));
  }, [rootNodeParam]);

  const prevArtifactNameRef = useRef<string | undefined>(undefined);

  const nodes = useMemo(
    () => rootNodes[artifactName] ?? [],
    [rootNodes, artifactName],
  );

  const handleSelect = useCallback(
    (url?: string) => {
      pushQueryParameter({ origin: url });
      setSelectedRootNode(getRootNodeName(url));
      setOpen(false);
    },
    [pushQueryParameter],
  );

  useEffect(() => {
    if (
      prevArtifactNameRef.current !== undefined &&
      prevArtifactNameRef.current !== artifactName
    ) {
      handleSelect(undefined);
    }
    prevArtifactNameRef.current = artifactName;
  }, [artifactName, handleSelect]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className="flex w-40 items-center justify-between h-4">
            <span className="flex-1 overflow-hidden text-left text-ellipsis">
              {selectedRootNode || "Select Origin"}
            </span>
            <CaretDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="z-50 w-56">
        {artifactName === "" ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Select an artifact first
          </div>
        ) : (
          <>
            {nodes.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No SBOM data yet
              </div>
            ) : (
              <>
                <DropdownMenuCheckboxItem
                  checked={!selectedRootNode}
                  onClick={() => handleSelect(undefined)}
                >
                  <span className="text-muted-foreground">Clear selection</span>
                </DropdownMenuCheckboxItem>

                {nodes.map((source) => {
                  const nodeName = getRootNodeName(source?.url);
                  return (
                    <DropdownMenuCheckboxItem
                      key={source.url ?? nodeName}
                      checked={selectedRootNode === nodeName}
                      onClick={() => handleSelect(source.url)}
                    >
                      {nodeName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
