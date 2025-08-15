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

import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { FunctionComponent, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import CopyCode from "../../common/CopyCode";
import DevguardTokenCard from "../../risk-identification/DevguardTokenCard";

interface AutomatedIntegrationSlideProps {
  pat: any;
  api?: {
    scrollTo: (index: number) => void;
  };
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  tab: "sbom" | "sarif";
  setTab: (tab: "sbom" | "sarif") => void;
}

const AutomatedIntegrationSlide: FunctionComponent<
  AutomatedIntegrationSlideProps
> = ({ pat, api, apiUrl, orgSlug, projectSlug, assetSlug, tab, setTab }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="mt-10 space-y-6">
        <DevguardTokenCard />

        <div>
          <h3 className="mb-4 text-lg font-semibold">Choose your scan type</h3>
          <div className="flex gap-2 mb-4">
            <Button
              variant={tab === "sbom" ? "default" : "outline"}
              onClick={() => setTab("sbom")}
              size="sm"
            >
              SBOM Scan
            </Button>
            <Button
              variant={tab === "sarif" ? "default" : "outline"}
              onClick={() => setTab("sarif")}
              size="sm"
            >
              SARIF Report
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              CLI Command
              <Badge variant="secondary">Copy & Paste</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Install DevGuard CLI</h4>
                <CopyCode
                  codeString="curl -sSL https://github.com/l3montree-dev/devguard-cli/releases/latest/download/install.sh | bash"
                  language="shell"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  {tab === "sbom" ? "Upload SBOM" : "Upload SARIF Report"}
                </h4>
                <CopyCode
                  codeString={
                    tab === "sbom"
                      ? `devguard-cli sbom upload --token $DEVGUARD_TOKEN --asset ${orgSlug}/${projectSlug}/${assetSlug} --file ./sbom.json`
                      : `devguard-cli sarif upload --token $DEVGUARD_TOKEN --asset ${orgSlug}/${projectSlug}/${assetSlug} --file ./report.sarif`
                  }
                  language="shell"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Set this environment variable in your CI/CD pipeline:
            </p>
            <CopyCode
              codeString={`DEVGUARD_TOKEN=${pat?.pat?.privKey || "your-token-here"}`}
              language="shell"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button variant="secondary" onClick={() => api?.scrollTo(3)}>
          Back
        </Button>
        <Button onClick={() => api?.scrollTo(0)}>Finish Setup</Button>
      </div>
    </CarouselItem>
  );
};

export default AutomatedIntegrationSlide;
