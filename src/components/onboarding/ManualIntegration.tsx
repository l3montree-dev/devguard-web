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
import {
  CommandLineIcon,
  CubeTransparentIcon,
  DocumentArrowUpIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import router from "next/router";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import Link from "next/link";
import Section from "../common/Section";
import CopyCode from "../common/CopyCode";
import usePersonalAccessToken from "../../hooks/usePersonalAccessToken";
import PatSection from "../risk-identification/PatSection";
import { Badge } from "../ui/badge";
import { classNames } from "../../utils/common";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";

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
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>
            Would you like to do it manual or automatic?
          </DialogTitle>
        </DialogHeader>
        <Card
          className={classNames(
            "cursor-pointer mt-10",
            variant === "auto"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setVariant("auto")}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <CommandLineIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              <span>Automatically upload using a Command Line Tool</span>
              <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
                Recommended
              </Badge>
            </CardTitle>
            <CardDescription>
              You want to automate the process of uploading SBOMs or
              SARIF-Reports? Maybe inside a CI/CD pipeline?
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className={classNames(
            "cursor-pointer mt-2",
            variant === "manual"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setVariant("manual")}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <DocumentArrowUpIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Manually upload a SBOM or SARIF file using a Drag&apos;n Drop
              interface
            </CardTitle>
            <CardDescription>
              You got a SBOM or SARIF file and want to upload it to DevGuard?
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex mt-8 flex-row gap-2 justify-end">
          <Button variant="secondary" onClick={() => prev?.()}>
            Back
          </Button>
          <Button onClick={() => next?.()}>Continue</Button>
        </div>
      </CarouselItem>
      {variant === "auto" && (
        <CarouselItem>
          <div>
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Automated integration</CardTitle>
              <CardDescription>
                Upload either an SBOM (CycloneDX) or a SARIF report from your
                own scanner.
              </CardDescription>
            </CardHeader>
            <Label>SBOM</Label>
            <div className="mt-2 mb-6">
              <CopyCode
                language="shell"
                codeString={`devguard-scanner sbom --token ${pat.pat ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} --path /path/to/sbom.json`}
              />
            </div>
            <Label>SARIF</Label>
            <div className="mt-2">
              <CopyCode
                language="shell"
                codeString={`devguard-scanner sarif --token ${pat.pat ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} --path /path/to/sbom.json`}
              />
            </div>
            <Card className="p-4 mt-10 mb-6">
              <PatSection description="Own Scanner Integration" {...pat} />
            </Card>
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button variant="secondary" onClick={() => prev?.()}>
              Back
            </Button>
          </div>
        </CarouselItem>
      )}
      {variant === "manual" && (
        <CarouselItem>
          <div className="">
            <Section
              description="Upload an SBOM or SARIF file by using the dropzone below."
              title="Manual integration"
              forceVertical
            >
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as "sbom" | "sarif")}
                defaultValue="sbom"
                className="w-full"
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
                        Upload a SARIF report from your scanner (.sarif or
                        JSON).
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
            </Section>
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
      )}
    </>
  );
};

export default ManualIntegration;
