// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ArtifactDTO, AssetVersionDTO } from "@/types/dto";
import ScanFileUpload from "@/components/onboarding/ScanFileUpload";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";

interface Props {
  api?: { scrollTo: (index: number) => void; reInit?: () => void };
  prevIndex: number;
  onClose: () => void;
  assetVersion?: AssetVersionDTO;
  artifacts?: ArtifactDTO[];
}

export default function ManualIntegrationSlide({
  api,
  prevIndex,
  onClose,
  assetVersion,
  artifacts,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const searchParams = useSearchParams();
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>Manual Integration</DialogTitle>
        <DialogDescription>
          Upload a CycloneDX SBOM, a SARIF report or a VEX document. The file
          type is detected automatically.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 px-1">
        <ScanFileUpload
          id="manual-integration-upload"
          initialRef={assetVersion}
          artifacts={artifacts}
          initialArtifact={
            searchParams?.get("artifact") || artifacts?.[0]?.artifactName
          }
          onLayoutChange={api?.reInit}
          onUploadingChange={setIsUploading}
          onUploaded={(destination) => {
            onClose();
            // Hard navigation refreshes cached asset data after the upload.
            window.location.assign(destination);
          }}
        />
        <Button
          className="mt-6"
          variant="secondary"
          id="manual-integration-back"
          disabled={isUploading}
          onClick={() => api?.scrollTo(prevIndex)}
        >
          Back
        </Button>
      </div>
    </CarouselItem>
  );
}
