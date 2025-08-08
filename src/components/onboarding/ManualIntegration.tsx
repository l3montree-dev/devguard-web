// Copyright (C) 2025 Lars Hermges, l3montree GmbH.  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.  You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.",

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";

import { CarouselItem, CarouselApi } from "@/components/ui/carousel";
import {
  multipartBrowserApiClient,
  browserApiClient,
} from "@/services/devGuardApi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import router from "next/router";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import Link from "next/link";

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

  return (
    <CarouselItem>
      <div className="">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Manual Integration</CardTitle>
          <CardDescription>
            Upload either an SBOM (CycloneDX) or a SARIF report from your own
            scanner.
          </CardDescription>
        </CardHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "sbom" | "sarif")}
          defaultValue="sbom"
          className="w-full mt-4"
        >
          <div className="flex">
            <TabsList>
              <TabsTrigger value="sbom">SBOM</TabsTrigger>
              <TabsTrigger value="sarif">SARIF</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sbom" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Upload SBOM</CardTitle>
                <CardDescription>
                  Upload a SBOM file in CycloneDX 1.6 or higher (JSON).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  files={sbomFileName ? [sbomFileName] : []}
                  dropzone={sbomDropzone}
                />
              </CardContent>
            </Card>

            <div className="mt-2 flex text-primary flex-row items-center">
              <QuestionMarkCircleIcon className="flex w-4 m-2" />
              <Link
                className="flex text-primary text-sm"
                href="https://devguard.org/guides/explaining-sboms"
                target="_blank"
              >
                How do I get a SBOM and upload it to DevGuard?
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="sarif" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Upload SARIF</CardTitle>
                <CardDescription>
                  Upload a SARIF report from your scanner (.sarif or JSON).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  files={sarifFileName ? [sarifFileName] : []}
                  dropzone={sarifDropzone}
                />
              </CardContent>
            </Card>
            <div className="mt-2 flex text-primary flex-row items-center">
              <QuestionMarkCircleIcon className="flex w-4 m-2" />
              <Link
                className="flex text-primary text-sm"
                href="https://devguard.org/guides/explaining-sarif"
                target="_blank"
              >
                How do I get a SARIF-Report and upload it to DevGuard?
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex mt-6 flex-row gap-2 justify-end">
          <Button variant="secondary" onClick={() => prev?.()}>
            Back
          </Button>
          <Button disabled={isUploadDisabled} onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default ManualIntegration;
