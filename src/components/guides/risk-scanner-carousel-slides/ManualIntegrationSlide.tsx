// Copyright (C) 2025 Lars Hermges, l3montree GmbH.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { SimpleArtifactSelector } from "@/components/ArtifactSelector";
import { ArtifactDTO } from "@/types/api/api";
import { QuestionMarkCircleIcon, TagIcon } from "@heroicons/react/24/outline";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { GitBranchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAssetBranchesAndTags } from "../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../hooks/useDecodedParams";
import { classNames } from "../../../utils/common";
import { BranchTagSelector } from "../../BranchTagSelector";
import FileUpload from "../../FileUpload";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface ManualIntegrationSlideProps {
  api?: {
    scrollTo: (index: number) => void;
    reInit?: () => void;
  };
  tab: "sbom" | "sarif" | "vex";
  setTab: (tab: "sbom" | "sarif" | "vex") => void;
  setArtifactName?: (name: string | undefined) => void;
  sbomFileName?: string;
  sarifFileName?: string;
  vexFileName?: string;
  sbomDropzone: any;
  vexDropzone: any;
  sarifDropzone: any;
  isUploadDisabled: boolean;
  prevIndex: number;
  onClose: () => void;
  handleUpload: (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => void;
  assetVersionName?: string;
  artifacts?: Array<ArtifactDTO>;
}

const ManualIntegrationSlide: FunctionComponent<
  ManualIntegrationSlideProps
> = ({
  api,
  tab,
  setTab,
  setArtifactName,
  sbomFileName,
  vexFileName,
  sarifFileName,
  sbomDropzone,
  vexDropzone,
  prevIndex,
  sarifDropzone,
  isUploadDisabled,
  handleUpload,
  artifacts,
}) => {
  const searchParams = useSearchParams();
  const { branches, tags } = useAssetBranchesAndTags();

  const [selectedArtifact, setSelectedArtifact] = React.useState<
    string | undefined
  >(() => {
    const urlArtifact = searchParams?.get("artifact");
    if (urlArtifact) {
      return urlArtifact;
    }
    // just the first one if exists
    if (artifacts && artifacts.length > 0) {
      return artifacts[0].artifactName;
    }
  });
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug?: string;
  };

  const [branchOrTagName, setBranchOrTagName] = useState(
    params.assetVersionSlug || "main",
  );
  const [artifactName, setArtifactNameLocal] = useState(
    "pkg:devguard/" + params.organizationSlug + "/" + params.assetSlug,
  );
  const [origin, setOrigin] = useState("SBOM_DEFAULT");
  const [isTag, setIsTag] = useState(false);

  // Update parent component when artifact changes
  React.useEffect(() => {
    if (setArtifactName) {
      setArtifactName(selectedArtifact);
    }
  }, [selectedArtifact, setArtifactName]);

  useEffect(() => {
    if (api?.reInit) {
      setTimeout(() => api.reInit && api.reInit(), 0);
    }

    setOrigin((prev) => {
      if (
        (prev === "SBOM_DEFAULT" || prev === "VEX_DEFAULT") &&
        (tab === "vex" || tab === "sbom")
      ) {
        return tab.toUpperCase() + "_DEFAULT";
      }
      return prev;
    });
  }, [api, tab, setOrigin]);

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle className="flex flex-row gap-2">
          Manual Integration
        </DialogTitle>
        <DialogDescription>
          Upload an SBOM or SARIF file by using the dropzone below.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 px-1">
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
              <TabsTrigger value="vex">VEX</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sbom" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Upload SBOM</CardTitle>
                <CardDescription>
                  Upload a SBOM file in CycloneDX 1.6 or higher (JSON).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  id="file-upload-sbom"
                  files={sbomFileName ? [sbomFileName] : []}
                  dropzone={sbomDropzone}
                />
              </CardContent>
            </Card>
            <div className="flex flex-row gap-2 mb-4">
              {branches.length == 0 && tags.length == 0 ? (
                <Collapsible
                  className="w-full"
                  onOpenChange={() => {
                    setTimeout(() => api?.reInit && api.reInit(), 0);
                  }}
                >
                  <CollapsibleTrigger className="text-muted-foreground flex flex-row justify-between w-full mt-4 pb-2 cursor-pointer text-sm">
                    More Options
                    <CaretDownIcon className="ml-2 inline-block h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="">
                    <div className="flex w-full border-t pt-4 flex-row gap-2">
                      <div className="w-full">
                        <Label className="mb-2 block">Branch/Tag Name</Label>
                        <Input
                          value={branchOrTagName}
                          onChange={(e) => setBranchOrTagName(e.target.value)}
                          placeholder="Enter branch or tag name"
                        />
                        <div className="flex items-center mt-2 gap-1 flex-row">
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "" : "border bg-card",
                            )}
                            onClick={() => setIsTag(false)}
                          >
                            <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "border bg-card" : "",
                            )}
                            onClick={() => setIsTag(true)}
                          >
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <span className="text-muted-foreground text-xs">
                            Select the type
                          </span>
                        </div>
                      </div>
                      <div className="w-full">
                        <Label className="mb-2 block">Artifact</Label>
                        <Input
                          value={artifactName}
                          onChange={(e) => setArtifactNameLocal(e.target.value)}
                          placeholder="Artifact name"
                        />
                      </div>
                      <div className="w-full">
                        <Label className="mb-2 block">Origin of the sbom</Label>
                        <Input
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="Origin"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="mt-4 flex flex-row gap-2">
                  <div>
                    <BranchTagSelector
                      branches={branches}
                      tags={tags}
                      disableNavigateToRefInsteadCall={(v) =>
                        setBranchOrTagName(v.name)
                      }
                    />
                  </div>
                  <SimpleArtifactSelector
                    artifacts={artifacts?.map((a) => a.artifactName) || []}
                    selectedArtifact={selectedArtifact}
                    onSelect={setSelectedArtifact}
                  />
                  <div className="w-full">
                    <Input
                      variant="onCard"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Origin"
                    />
                    <span className="text-muted-foreground text-xs">
                      Origin of the SBOM (e.g., DEFAULT)
                    </span>
                  </div>
                </div>
              )}
            </div>
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
          <TabsContent value="sarif" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Upload SARIF</CardTitle>
                <CardDescription>
                  Upload a SARIF report from your scanner (.sarif or JSON).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  id="file-upload-sarif"
                  files={sarifFileName ? [sarifFileName] : []}
                  dropzone={sarifDropzone}
                />
              </CardContent>
            </Card>
            <div className="flex flex-row gap-2 mb-4">
              {branches.length == 0 && tags.length == 0 ? (
                <Collapsible
                  className="w-full"
                  onOpenChange={() => {
                    setTimeout(() => api?.reInit && api.reInit(), 0);
                  }}
                >
                  <CollapsibleTrigger className="text-muted-foreground flex flex-row justify-between w-full mt-4 pb-2 cursor-pointer text-sm">
                    More Options
                    <CaretDownIcon className="ml-2 inline-block h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="">
                    <div className="flex w-full border-t pt-4 flex-row gap-2">
                      <div className="w-full">
                        <Label className="mb-2 block">Branch/Tag Name</Label>
                        <Input
                          value={branchOrTagName}
                          onChange={(e) => setBranchOrTagName(e.target.value)}
                          placeholder="Enter branch or tag name"
                        />
                        <div className="flex items-center mt-2 gap-1 flex-row">
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "" : "border bg-card",
                            )}
                            onClick={() => setIsTag(false)}
                          >
                            <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "border bg-card" : "",
                            )}
                            onClick={() => setIsTag(true)}
                          >
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <span className="text-muted-foreground text-xs">
                            Select the type
                          </span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="mt-4 flex flex-row gap-2">
                  <div>
                    <BranchTagSelector
                      branches={branches}
                      tags={tags}
                      disableNavigateToRefInsteadCall={(v) =>
                        setBranchOrTagName(v.name)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
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
          <TabsContent value="vex" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Upload VEX-File</CardTitle>
                <CardDescription>
                  Upload a VEX file in CycloneDX 1.6 or higher (JSON).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  id="file-upload-vex"
                  files={vexFileName ? [vexFileName] : []}
                  dropzone={vexDropzone}
                />
              </CardContent>
            </Card>
            <div className="flex flex-row gap-2 mb-4">
              {branches.length == 0 && tags.length == 0 ? (
                <Collapsible
                  className="w-full"
                  onOpenChange={() => {
                    setTimeout(() => api?.reInit && api.reInit(), 0);
                  }}
                >
                  <CollapsibleTrigger className="text-muted-foreground flex flex-row justify-between w-full mt-4 pb-2 cursor-pointer text-sm">
                    More Options
                    <CaretDownIcon className="ml-2 inline-block h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="">
                    <div className="flex w-full border-t pt-4 flex-row gap-2">
                      <div className="w-full">
                        <Label className="mb-2 block">Branch/Tag Name</Label>
                        <Input
                          value={branchOrTagName}
                          onChange={(e) => setBranchOrTagName(e.target.value)}
                          placeholder="Enter branch or tag name"
                        />
                        <div className="flex items-center mt-2 gap-1 flex-row">
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "" : "border bg-card",
                            )}
                            onClick={() => setIsTag(false)}
                          >
                            <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className={classNames(
                              "p-1 rounded",
                              isTag ? "border bg-card" : "",
                            )}
                            onClick={() => setIsTag(true)}
                          >
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <span className="text-muted-foreground text-xs">
                            Select the type
                          </span>
                        </div>
                      </div>
                      <div className="w-full">
                        <Label className="mb-2 block">Artifact</Label>
                        <Input
                          value={artifactName}
                          onChange={(e) => setArtifactNameLocal(e.target.value)}
                          placeholder="Artifact name"
                        />
                      </div>
                      <div className="w-full">
                        <Label className="mb-2 block">Origin of the VeX</Label>
                        <Input
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="Origin"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="mt-4 flex flex-row gap-2">
                  <div>
                    <BranchTagSelector
                      branches={branches}
                      tags={tags}
                      disableNavigateToRefInsteadCall={(v) =>
                        setBranchOrTagName(v.name)
                      }
                    />
                  </div>
                  <SimpleArtifactSelector
                    artifacts={artifacts?.map((a) => a.artifactName) || []}
                    selectedArtifact={selectedArtifact}
                    onSelect={setSelectedArtifact}
                  />
                  <div className="w-full">
                    <Input
                      variant="onCard"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Origin"
                    />
                    <span className="text-muted-foreground text-xs">
                      Origin of the VEX (e.g., DEFAULT)
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex text-primary flex-row items-center">
              <QuestionMarkCircleIcon className="flex w-4 m-2" />
              <Link
                className="flex text-primary text-sm"
                href="https://devguard.org/guides/explaining-sboms"
                target="_blank"
              >
                How do I get a VEX and upload it to DevGuard?
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex mt-6 flex-row gap-2 justify-end">
          <Button
            variant="secondary"
            id="manual-integration-back"
            onClick={() => api?.scrollTo(prevIndex)}
          >
            Back
          </Button>
          <Button
            disabled={isUploadDisabled}
            id="manual-integration-continue"
            onClick={() =>
              handleUpload({
                branchOrTagName,
                isTag,
                artifactName:
                  selectedArtifact || artifactName || "unnamed-artifact",
                // lets mark the first one as default
                isDefault: !isTag && branches.length + tags.length === 0,
                origin,
              })
            }
          >
            Upload
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default ManualIntegrationSlide;
