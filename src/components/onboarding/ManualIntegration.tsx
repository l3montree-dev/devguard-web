// Copyright (C) 2025 Lars Hermges, l3montree GmbH.  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.  You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.",

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { config } from "@/config";
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
import { Separator } from "../ui/separator";
import CopyCode from "../common/CopyCode";

type Command = "container-scanning" | "sbom" | "sarif";

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

  const [sbomFileName, setSbomFileName] = useState<string | undefined>();
  const sbomFileRef = useRef<File | undefined>(undefined);

  const [sarifFileName, setSarifFileName] = useState<string | undefined>();
  const sarifContentRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    api?.reInit();
  }, [tab, sbomFileName, sarifFileName, api]);

  //   const generateDockerSnippet = (
  //     command: string,
  //     orgSlug: string,
  //     projectSlug: string,
  //     assetSlug: string,
  //     apiUrl: string,
  //     token?: string,
  //   ) => {
  //     let path = "/app";
  //     if (command === "container-scanning") {
  //       path = "/app/image.tar";
  //     }

  //     if (command === "sbom") {
  //       path = "/app/<SBOM.json>";
  //     }

  //     if (command === "sarif") {
  //       path = "/app/results.sarif";
  //     }

  //     if (apiUrl === "http://localhost:8080") {
  //       apiUrl = "http://host.docker.internal:8080";
  //     }
  //     return `docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner:${config.devguardScannerTag} \\
  // devguard-scanner ${command} \\
  //     --path="${path}" \\
  //     --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
  //     --apiUrl="${apiUrl}" \\
  //     --token="${token ? token : "TOKEN"}"`;
  //   };

  const onDropSbom = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("SBOM file reading was aborted");
      reader.onerror = () => console.log("SBOM file reading has failed");
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
      reader.onabort = () => console.log("SARIF file reading was aborted");
      reader.onerror = () => console.log("SARIF file reading has failed");
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

      next?.();
    } else {
      toast.error("SBOM has not been sent successfully");
    }
  };

  const uploadSARIF = async () => {
    if (!sarifContentRef.current) return;

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
      next?.();
    } else {
      toast.error("SARIF report has not been sent successfully");
    }
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
          </TabsContent>
        </Tabs>

        {/* <Separator className="mt-6" orientation="horizontal" />

        <div className="mt-6">
          <CopyCode
            language="shell"
            codeString={generateDockerSnippet(
              "sbom",
              orgSlug,
              projectSlug,
              assetSlug,
              apiUrl,
            )}
          /> */}
        {/* </div> */}
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
