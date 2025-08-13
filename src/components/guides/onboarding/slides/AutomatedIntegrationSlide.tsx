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

import { FunctionComponent } from "react";
import CopyCode from "../../../common/CopyCode";
import PatSection from "../../../risk-identification/PatSection";
import { Button } from "../../../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { CarouselItem } from "../../../ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";

interface AutomatedIntegrationSlideProps {
  pat: ReturnType<
    typeof import("../../../../hooks/usePersonalAccessToken").default
  >;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  tab?: "sbom" | "sarif";
  setTab?: (tab: "sbom" | "sarif") => void;
  prev?: () => void;
}

const AutomatedIntegrationSlide: FunctionComponent<
  AutomatedIntegrationSlideProps
> = ({
  pat,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
  tab = "sbom",
  setTab,
  prev,
}) => {
  return (
    <CarouselItem>
      <div>
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Automated integration</CardTitle>
          <CardDescription>
            Upload either an SBOM (CycloneDX) or a SARIF report from your own
            scanner.
          </CardDescription>
        </CardHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab?.(v as "sbom" | "sarif")}
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
                <CardTitle className="text-md">SBOM Command</CardTitle>
                <CardDescription>
                  Use the devguard-scanner CLI tool to upload SBOM files
                  (CycloneDX format).
                </CardDescription>
              </CardHeader>
              <div className="p-6 pt-0">
                <CopyCode
                  language="shell"
                  codeString={`devguard-scanner sbom --token ${pat.pat ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} --path /path/to/sbom.json`}
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
                  codeString={`devguard-scanner sarif --token ${pat.pat ?? "YOU_NEED_TO_GENERATE_A_TOKEN"} --apiUrl "${apiUrl}" --assetName ${orgSlug}/${projectSlug}/${assetSlug} --path /path/to/report.sarif`}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

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
  );
};

export default AutomatedIntegrationSlide;
