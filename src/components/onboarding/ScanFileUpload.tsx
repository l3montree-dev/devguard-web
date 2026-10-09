// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import FileUpload from "@/components/FileUpload";
import ManualUploadOptionsFields from "@/components/guides/risk-scanner-carousel-slides/ManualUploadOptionsFields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { toast } from "@/lib/toast";
import {
  uploadSarif,
  uploadSbomFile,
  uploadVex,
} from "@/services/scanUploadService";
import type { ManualUploadKind } from "@/types/view/integration";
import type { Surface } from "@/lib/surface";
import { ensureValidBranchOrTagSlug } from "@/utils/common";
import { useCallback, useState } from "react";
import type { FunctionComponent } from "react";
import { useDropzone } from "react-dropzone";

const kindLabels: Record<ManualUploadKind, string> = {
  sbom: "CycloneDX SBOM",
  sarif: "SARIF report",
  vex: "VEX document",
};

// detects which kind of report a parsed json file is - returns undefined if unknown
export const detectUploadKind = (
  parsed: Record<string, unknown>,
): ManualUploadKind | undefined => {
  if (
    (typeof parsed.$schema === "string" && parsed.$schema.includes("sarif")) ||
    (typeof parsed.version === "string" && Array.isArray(parsed.runs))
  ) {
    return "sarif";
  }
  if (
    (typeof parsed["@context"] === "string" &&
      parsed["@context"].includes("openvex")) ||
    (parsed.document as { category?: string } | undefined)?.category ===
      "csaf_vex"
  ) {
    return "vex";
  }
  if (parsed.bomFormat === "CycloneDX") {
    // a CycloneDX document without components, but with vulnerabilities is a VEX
    const components = parsed.components as unknown[] | undefined;
    const vulnerabilities = parsed.vulnerabilities as unknown[] | undefined;
    if (
      (!components || components.length === 0) &&
      vulnerabilities &&
      vulnerabilities.length > 0
    ) {
      return "vex";
    }
    return "sbom";
  }
  return undefined;
};

interface Props {
  // called with the page to show the uploaded results
  onUploaded: (destination: string) => void;
  // branch/ tag, artifact and origin fields - hidden during the onboarding,
  // where the defaults are used
  showOptions?: boolean;
  // the surface the upload is rendered on
  variant?: Surface;
}

const ScanFileUpload: FunctionComponent<Props> = ({
  onUploaded,
  showOptions = true,
  variant,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const asset = useActiveAsset()!;
  const { branches, tags } = useAssetBranchesAndTags();

  const [file, setFile] = useState<{
    file: File;
    content: string;
    kind: ManualUploadKind;
  }>();
  const [branchOrTagName, setBranchOrTagName] = useState("main");
  const [branchOrTagSlug, setBranchOrTagSlug] = useState("main");
  const [isTag, setIsTag] = useState(false);
  const [artifactName, setArtifactName] = useState(
    `pkg:devguard/${activeOrg.slug}/${activeProject.slug}/${asset.slug}`,
  );
  const [origin, setOrigin] = useState("SBOM_DEFAULT");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const dropped = acceptedFiles[0];
    if (!dropped) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      let kind: ManualUploadKind | undefined;
      try {
        kind = detectUploadKind(JSON.parse(content));
      } catch {
        toast.error(
          "JSON format is not recognized, make sure it is the proper format",
        );
        return;
      }
      if (!kind) {
        toast.error(
          "Unknown file type. Upload a CycloneDX SBOM, a SARIF report or a VEX document (CycloneDX, CSAF or OpenVEX).",
        );
        return;
      }
      setFile({ file: dropped, content, kind });
      setOrigin(kind.toUpperCase() + "_DEFAULT");
    };
    reader.readAsText(dropped);
  }, []);

  const dropzone = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/json": [".json"],
      "application/sarif+json": [".sarif"],
      "text/plain": [".sarif"],
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    const assetUrl = `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset.slug}`;
    const target = {
      assetName: `${activeOrg.slug}/${activeProject.slug}/${asset.slug}`,
      branchOrTagName,
      isTag,
      // lets mark the first one as default
      isDefault: !isTag && branches.length + tags.length === 0,
      artifactName: artifactName || "unnamed-artifact",
      origin,
    };
    const refUrl = `${assetUrl}/refs/${ensureValidBranchOrTagSlug(branchOrTagSlug)}`;

    setIsUploading(true);
    try {
      if (file.kind === "sbom") {
        const resp = await uploadSbomFile(
          {
            organization: decodeURIComponent(activeOrg.slug),
            projectSlug: activeProject.slug,
            assetSlug: asset.slug,
          },
          target,
          file.file,
        );
        if (!resp.ok) {
          toast.error(
            "SBOM has not been sent successfully. Reason: " +
              (await resp.text()),
          );
          return;
        }
        onUploaded(
          `${refUrl}/dependency-risks?artifact=${encodeURIComponent(target.artifactName)}`,
        );
      } else if (file.kind === "sarif") {
        await uploadSarif(target, file.content);
        onUploaded(`${refUrl}/code-risks/`);
      } else {
        await uploadVex(target, file.content);
        onUploaded(`${assetUrl}/vex-rules/`);
      }
      toast.success(`${kindLabels[file.kind]} has successfully been sent!`);
    } catch {
      toast.error(`${kindLabels[file.kind]} has not been sent successfully`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <FileUpload
        id="onboarding-upload"
        variant={variant}
        files={file ? [file.file.name] : []}
        dropzone={dropzone}
      />
      {file && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Detected file type:
          <Badge variant="secondary">{kindLabels[file.kind]}</Badge>
        </div>
      )}
      {showOptions && (
        <ManualUploadOptionsFields
          options={{
            branches,
            tags,
            branchOrTagName,
            onBranchOrTagChange: (name, slug, nextIsTag) => {
              setBranchOrTagName(name);
              setBranchOrTagSlug(slug);
              setIsTag(nextIsTag);
            },
            isTag,
            onIsTagChange: setIsTag,
            artifactName,
            onArtifactNameChange: setArtifactName,
            onSelectedArtifactChange: (name) => setArtifactName(name ?? ""),
            origin,
            onOriginChange: setOrigin,
            onReInit: () => {},
          }}
          originLabel="Origin"
          originHint="Origin of the report (e.g., SBOM_DEFAULT)"
          showArtifact={file?.kind !== "sarif"}
        />
      )}
      <Button
        // stays at the bottom when the parent stretches the upload
        className="mt-auto self-end"
        data-testid="onboarding-upload-submit"
        disabled={!file || isUploading}
        isSubmitting={isUploading}
        onClick={handleUpload}
      >
        {file ? `Upload ${kindLabels[file.kind]}` : "Upload"}
      </Button>
    </div>
  );
};

export default ScanFileUpload;
