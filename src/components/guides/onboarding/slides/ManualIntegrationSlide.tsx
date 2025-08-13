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
import { CarouselItem } from "../../../ui/carousel";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import FileUpload from "../../../FileUpload";
import Section from "../../../common/Section";

interface ManualIntegrationSlideProps {
  tab: "sbom" | "sarif";
  setTab: (tab: "sbom" | "sarif") => void;
  sbomFileName?: string;
  sarifFileName?: string;
  sbomDropzone: any;
  sarifDropzone: any;
  isUploadDisabled: boolean;
  handleUpload: () => void;
  prev?: () => void;
}

const ManualIntegrationSlide: FunctionComponent<
  ManualIntegrationSlideProps
> = ({
  tab,
  setTab,
  sbomFileName,
  sarifFileName,
  sbomDropzone,
  sarifDropzone,
  isUploadDisabled,
  handleUpload,
  prev,
}) => {
  return (
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
  );
};

export default ManualIntegrationSlide;
