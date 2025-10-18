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

import React, { FunctionComponent } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CarouselItem } from "../../ui/carousel";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import FileUpload from "../../FileUpload";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ArtifactDTO } from "@/types/api/api";
import { SimpleArtifactSelector } from "@/components/ArtifactSelector";
import { Badge } from "@/components/ui/badge";
import { GitBranchIcon } from "lucide-react";

interface ManualIntegrationSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  tab: "sbom" | "sarif";
  setTab: (tab: "sbom" | "sarif") => void;
  setArtifactName?: (name: string | undefined) => void;
  sbomFileName?: string;
  sarifFileName?: string;
  sbomDropzone: any;
  sarifDropzone: any;
  isUploadDisabled: boolean;
  prevIndex: number;
  onClose: () => void;
  handleUpload: () => void;
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
  sarifFileName,
  sbomDropzone,
  prevIndex,
  sarifDropzone,
  isUploadDisabled,
  handleUpload,
  assetVersionName,
  artifacts,
}) => {
  const searchParams = useSearchParams();

  const [selectedArtifact, setSelectedArtifact] = React.useState<
    string | undefined
  >(() => {
    const urlArtifact = searchParams?.get("artifact");
    if (urlArtifact) {
      return urlArtifact;
    }
  });

  // Update parent component when artifact changes
  React.useEffect(() => {
    if (setArtifactName) {
      setArtifactName(selectedArtifact);
    }
  }, [selectedArtifact, setArtifactName]);

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
      <div className="mt-10 px-1">
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
          {tab === "sbom" && (
            <div className="my-4  flex flex-row gap-6">
              <Badge variant={"outline"} className="ml-1">
                <GitBranchIcon className="mr-1 h-5 w-5 text-muted-foreground" />
                {assetVersionName}
              </Badge>
              <SimpleArtifactSelector
                unassignPossible
                artifacts={artifacts?.map((a) => a.artifactName) || []}
                selectedArtifact={selectedArtifact}
                onSelect={setSelectedArtifact}
              />
            </div>
          )}
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
                  id="file-upload-sbom"
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
                  id="file-upload-sarif"
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
            onClick={handleUpload}
          >
            Upload
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default ManualIntegrationSlide;
