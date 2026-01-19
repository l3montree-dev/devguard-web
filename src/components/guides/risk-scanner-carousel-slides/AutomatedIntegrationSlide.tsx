// Copyright (C) 2025 Lars Hermges, l3montree GmbH.
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

import { FunctionComponent } from "react";
import usePersonalAccessToken from "../../../hooks/usePersonalAccessToken";
import CopyCode from "../../common/CopyCode";
import PatSection from "../../PatSection";
import { Button } from "../../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface AutomatedIntegrationSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  prevIndex: number;
  onClose: () => void;
}

const AutomatedIntegrationSlide: FunctionComponent<
  AutomatedIntegrationSlideProps
> = ({ api, apiUrl, orgSlug, projectSlug, assetSlug, prevIndex, onClose }) => {
  const pat = usePersonalAccessToken();
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle className="flex flex-row gap-2">
          CLI Integration Setup
        </DialogTitle>
        <DialogDescription>
          Use the DevGuard CLI tool to automatically upload scan results from
          your CI/CD pipeline.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="sbom" className="w-full mt-10">
        <div className="flex">
          <TabsList>
            <TabsTrigger value="sbom">SBOM</TabsTrigger>
            <TabsTrigger value="sarif">SARIF</TabsTrigger>
            <TabsTrigger value="vex">VEX</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sbom" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">SBOM Command</CardTitle>
              <CardDescription>
                Use the devguard-scanner CLI tool to upload SBOM files
                (CycloneDX format).
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <CopyCode
                language="shell"
                codeString={`devguard-scanner sbom --token ${pat.pat?.privKey ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} /path/to/sbom.json`}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sarif" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">SARIF Command</CardTitle>
              <CardDescription>
                Use the devguard-scanner CLI tool to upload SARIF reports from
                your security scanners.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <CopyCode
                language="shell"
                codeString={`devguard-scanner sarif --token ${pat.pat?.privKey ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} /path/to/report.sarif`}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vex" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">VEX Command</CardTitle>
              <CardDescription>
                Use the devguard-scanner CLI tool to upload VEX documents from
                your security scanners.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <CopyCode
                language="shell"
                codeString={`devguard-scanner vex --token ${pat.pat?.privKey ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} /path/to/vex.json`}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10">
        <PatSection
          {...pat}
          description="Risk Identification using CLI Setup"
        />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button
          variant="secondary"
          id="automated-integration-back"
          onClick={() => api?.scrollTo(prevIndex)}
        >
          Back
        </Button>
        <Button id="automated-integration-continue" onClick={onClose}>
          Finish Setup
        </Button>
      </div>
    </CarouselItem>
  );
};

export default AutomatedIntegrationSlide;
