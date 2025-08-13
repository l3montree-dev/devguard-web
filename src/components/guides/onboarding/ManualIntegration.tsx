// Copyright (C) 2025 Lars Hermges, l3montree GmbH.  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.  You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.",

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { CarouselApi } from "@/components/ui/carousel";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import {
  browserApiClient,
  multipartBrowserApiClient,
} from "@/services/devGuardApi";
import router from "next/router";
import usePersonalAccessToken from "../../../hooks/usePersonalAccessToken";
import {
  IntegrationMethodSelectionSlide,
  AutomatedIntegrationSlide,
  ManualIntegrationSlide,
} from "./slides";

const ManualIntegration = ({
  api,
  apiUrl,
  next,
  prev,
  orgSlug,
  projectSlug,
  assetSlug,
  sarifEndpoint = "/sarif-scan",
}: {
  api: CarouselApi | undefined;
  apiUrl: string;
  next?: () => void;
  prev?: () => void;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  sarifEndpoint?: string;
}) => {
  const [tab, setTab] = useState<"sbom" | "sarif">("sbom");
  const activeAssetVersion = useActiveAssetVersion()!;

  const [sbomFileName, setSbomFileName] = useState<string | undefined>();
  const sbomFileRef = useRef<File | undefined>(undefined);

  const [sarifFileName, setSarifFileName] = useState<string | undefined>();
  const sarifContentRef = useRef<string | undefined>(undefined);

  const [variant, setVariant] = useState<"manual" | "auto">("auto");

  useEffect(() => {
    api?.reInit();
  }, [tab, sbomFileName, sarifFileName, api]);

  const onDropSbom = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const txt = reader.result as string;
          const parsed = JSON.parse(txt);
          if (parsed?.bomFormat === "CycloneDX") {
            sbomFileRef.current = file;
            setSbomFileName(file.name);
          } else {
            toast.error(
              "SBOM does not follow CycloneDX format or Version is < 1.6",
            );
          }
        } catch (_e) {
          toast.error(
            "JSON format is not recognized, make sure it is the proper format",
          );
          return;
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const sbomDropzone = useDropzone({
    onDrop: onDropSbom,
    accept: { "application/json": [".json"] },
  });

  const onDropSarif = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        sarifContentRef.current = reader.result as string;
        setSarifFileName(file.name);
      };
      reader.readAsText(file);
    });
  }, []);

  const sarifDropzone = useDropzone({
    onDrop: onDropSarif,
    accept: {
      "application/json": [".json"],
      "application/sarif+json": [".sarif"],
      "text/plain": [".sarif"],
    },
  });

  const uploadSBOM = async () => {
    if (!sbomFileRef.current) return;
    const formdata = new FormData();
    formdata.append("file", sbomFileRef.current);

    const resp = await multipartBrowserApiClient(
      `/organizations/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/sbom-file`,
      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "SBOM-File-Upload" },
      },
    );

    if (resp.ok) {
      toast.success("SBOM has successfully been sent!");
    } else {
      toast.error("SBOM has not been sent successfully");
    }
    router.push(
      `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/main/dependency-risks/`,
    );
  };

  const uploadSARIF = async () => {
    if (!sarifContentRef.current) return;

    console.log(activeAssetVersion);
    const resp = await browserApiClient(`${sarifEndpoint}`, {
      method: "POST",
      body: sarifContentRef.current,
      headers: {
        "X-Scanner": "SARIF-File-Upload",
        "X-Asset-Name": `${orgSlug}/${projectSlug}/${assetSlug}`,
      },
    });

    if (resp.ok) {
      toast.success("SARIF report has successfully been sent!");
    } else {
      toast.error("SARIF report has not been sent successfully");
    }
    router.push(
      `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/main/code-risks/`,
    );
  };

  const isUploadDisabled = tab === "sbom" ? !sbomFileName : !sarifFileName;
  const handleUpload = () => (tab === "sbom" ? uploadSBOM() : uploadSARIF());

  const pat = usePersonalAccessToken();

  return (
    <>
      <IntegrationMethodSelectionSlide
        variant={variant}
        setVariant={setVariant}
        next={next}
        prev={prev}
      />
      {variant === "auto" && (
        <AutomatedIntegrationSlide
          pat={pat}
          apiUrl={apiUrl}
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          assetSlug={assetSlug}
          tab={tab}
          setTab={setTab}
          prev={prev}
        />
      )}
      {variant === "manual" && (
        <ManualIntegrationSlide
          tab={tab}
          setTab={setTab}
          sbomFileName={sbomFileName}
          sarifFileName={sarifFileName}
          sbomDropzone={sbomDropzone}
          sarifDropzone={sarifDropzone}
          isUploadDisabled={isUploadDisabled}
          handleUpload={handleUpload}
          prev={prev}
        />
      )}
    </>
  );
};

export default ManualIntegration;
