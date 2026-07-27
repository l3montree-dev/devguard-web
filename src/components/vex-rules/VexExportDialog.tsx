// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import Callout from "@/components/common/Callout";
import { DelayedDownloadButton } from "@/components/common/DelayedDownloadButton";
import {
  PublicUrlSection,
  usePublicSharing,
} from "@/components/dependencies/PublicUrlSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/context/ConfigContext";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";
import type { ArtifactDTO } from "@/types/api/api";
import { FileCode, GitBranchIcon } from "lucide-react";
import Image from "next/image";
import { useState, type FunctionComponent } from "react";
import useSWR from "swr";

interface VexExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Exports this repository's own VEX document. VEX is published per branch/tag
 * and artifact, so both are selected here — this page itself is asset-wide.
 */
const VexExportDialog: FunctionComponent<VexExportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const config = useConfig();
  const asset = useActiveAsset();
  const { sharesInformation, isPublicLoading, handleTogglePublic } =
    usePublicSharing();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const refs = asset?.refs ?? [];
  const [selectedRef, setSelectedRef] = useState<string | undefined>(undefined);
  // Default to the asset's default branch until the user picks a reference.
  const ref =
    selectedRef ??
    refs.find((assetVersion) => assetVersion.defaultBranch)?.slug ??
    refs[0]?.slug;

  const assetBasePath = `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}`;
  const { data: artifacts } = useSWR<ArtifactDTO[]>(
    open && ref
      ? `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${ref}/artifacts/`
      : null,
    fetcher,
  );

  const [selectedArtifact, setSelectedArtifact] = useState<string | undefined>(
    undefined,
  );
  // Fall back to the first artifact of the selected ref, so switching refs never
  // leaves a stale artifact selected.
  const artifactNames = (artifacts ?? []).map((a) => a.artifactName);
  const artifact =
    selectedArtifact && artifactNames.includes(selectedArtifact)
      ? selectedArtifact
      : artifactNames[0];

  const downloadHref = (file: "vex.json" | "vex.xml") =>
    `${assetBasePath}/refs/${ref}/${file}?${new URLSearchParams({
      artifact: artifact ?? "",
    })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your VEX</DialogTitle>
          <DialogDescription>
            Download this repository&apos;s VEX (Vulnerability Exploitability
            eXchange) document, or hand out a URL that always serves the current
            state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mt-4 font-semibold">Branch / Tag</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              VEX is published per reference.
            </p>
            <Select
              value={ref}
              onValueChange={setSelectedRef}
              disabled={refs.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a branch or tag" />
              </SelectTrigger>
              <SelectContent>
                {refs.map((assetVersion) => (
                  <SelectItem key={assetVersion.slug} value={assetVersion.slug}>
                    <span className="flex flex-row items-center gap-2">
                      <GitBranchIcon className="h-3 w-3 text-muted-foreground" />
                      {assetVersion.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="mt-4 font-semibold">Artifact</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Select the artifact to export.
            </p>
            <Select
              value={artifact}
              onValueChange={setSelectedArtifact}
              disabled={artifactNames.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    artifacts === undefined
                      ? "Loading artifacts..."
                      : "No artifacts on this reference"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {artifactNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AuthGuard require="admin">
          <PublicUrlSection
            sharesInformation={sharesInformation}
            isPublicLoading={isPublicLoading}
            onToggle={handleTogglePublic}
            selectedArtifact={artifact}
            assetVersionSlug={ref}
            assetId={asset?.id}
            devguardApiUrl={config.devguardApiUrlPublicInternet}
            fileType="vex.json"
            toastLabel="VEX URL"
          />
        </AuthGuard>

        <hr className="mt-2" />
        <h4 className="mt-4 font-semibold">Machine Readable Formats</h4>
        <p className="text-sm text-muted-foreground">
          The VEX is available in CycloneDX JSON and XML format.
        </p>
        <div className="mt-2 flex items-start justify-start gap-4">
          <DelayedDownloadButton
            data-testid="download-vex-json-format"
            href={downloadHref("vex.json")}
            icon={
              <Image
                src="/assets/cyclonedx-logo.svg"
                alt="CycloneDX Logo"
                width={20}
                height={20}
                className="inline-block h-5 w-auto"
              />
            }
            label="Download in JSON-Format"
            downloadFileName={`${asset?.name}_vex.json`}
          />
          <DelayedDownloadButton
            href={downloadHref("vex.xml")}
            icon={<FileCode className="inline-block h-5 w-auto text-success" />}
            label="Download in XML-Format"
            downloadFileName={`${asset?.name}_vex.xml`}
          />
        </div>

        <Callout intent="neutral">
          <span>
            <strong>Note:</strong> this exports the VEX statements for the
            selected artifact — the VEX rules on this page are what produce
            them, but they are not exported as rules.
          </span>
        </Callout>
      </DialogContent>
    </Dialog>
  );
};

export default VexExportDialog;
