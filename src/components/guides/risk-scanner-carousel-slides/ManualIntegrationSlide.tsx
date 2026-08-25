// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ArtifactDTO } from "@/types/api/api";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useEffect, useState } from "react";
import { useAssetBranchesAndTags } from "../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../hooks/useDecodedParams";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { documentationLinks } from "@/const/documentationLinks";
import ManualUploadTab from "./ManualUploadTab";
import type {
  ManualUploadKind,
  ManualUploadOptions,
  ManualUploadTab as ManualUploadTabConfig,
} from "@/types/view/integration";

const UPLOAD_TABS: ManualUploadTabConfig[] = [
  {
    value: "sbom",
    title: "Upload SBOM",
    description: "Upload a SBOM file in CycloneDX 1.6 or higher (JSON).",
    originLabel: "Origin of the SBOM",
    originHint: "Origin of the SBOM (e.g., DEFAULT)",
    showArtifact: true,
    docHref: documentationLinks.sbomExplaining,
    docLabel: "What is an SBOM and how do I create one?",
  },
  {
    value: "sarif",
    title: "Upload SARIF",
    description: "Upload a SARIF report from your scanner (.sarif or JSON).",
    originLabel: "Origin of the SARIF",
    originHint: "Origin of the SARIF (e.g., DEFAULT)",
    showArtifact: false,
  },
  {
    value: "vex",
    title: "Upload VEX-File",
    description: "Upload a VEX file in CycloneDX 1.6 or higher (JSON).",
    originLabel: "Origin of the VEX",
    originHint: "Origin of the VEX (e.g., DEFAULT)",
    showArtifact: true,
    docHref: documentationLinks.vexExplaining,
    docLabel: "What is VEX?",
  },
];

interface ManualIntegrationSlideProps {
  api?: {
    scrollTo: (index: number) => void;
    reInit?: () => void;
  };
  tab: ManualUploadKind;
  setTab: (tab: ManualUploadKind) => void;
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
    branchOrTagSlug: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => Promise<void>;
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

  const [selectedArtifact, setSelectedArtifact] = useState<string | undefined>(
    () => {
      const urlArtifact = searchParams?.get("artifact");
      if (urlArtifact) {
        return urlArtifact;
      }
      // just the first one if exists
      if (artifacts && artifacts.length > 0) {
        return artifacts[0].artifactName;
      }
    },
  );
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug?: string;
  };

  const [branchOrTagName, setBranchOrTagName] = useState(
    params.assetVersionSlug || "main",
  );
  const [branchOrTagSlug, setBranchOrTagSlug] = useState(
    params.assetVersionSlug || "main",
  );

  const [artifactName, setArtifactNameLocal] = useState(
    "pkg:devguard/" +
      params.organizationSlug +
      "/" +
      params.projectSlug +
      "/" +
      params.assetSlug,
  );
  const [origin, setOrigin] = useState(tab.toUpperCase() + "_DEFAULT");
  const [isTag, setIsTag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const matchedBranch = branches.find(
    (branch) => branch.slug === branchOrTagName,
  );
  const matchedTag = matchedBranch
    ? undefined
    : tags.find((tag) => tag.slug === branchOrTagName);
  const matchedRef = matchedBranch ?? matchedTag;

  if (matchedRef && matchedRef.name !== branchOrTagName) {
    setBranchOrTagName(matchedRef.name);
    setBranchOrTagSlug(matchedRef.slug);
    setIsTag(Boolean(matchedTag));
  }

  // Update parent component when artifact changes
  useEffect(() => {
    if (setArtifactName) {
      setArtifactName(selectedArtifact);
    }
  }, [selectedArtifact, setArtifactName]);

  const [prevTab, setPrevTab] = useState(tab);

  if (tab !== prevTab) {
    setPrevTab(tab);
    setOrigin(tab.toUpperCase() + "_DEFAULT");
  }

  useEffect(() => {
    if (api?.reInit) {
      setTimeout(() => api.reInit && api.reInit(), 0);
    }
  }, [api, tab]);

  const fileNames: Record<ManualUploadKind, string | undefined> = {
    sbom: sbomFileName,
    sarif: sarifFileName,
    vex: vexFileName,
  };

  const dropzones: Record<ManualUploadKind, any> = {
    sbom: sbomDropzone,
    sarif: sarifDropzone,
    vex: vexDropzone,
  };

  const options: ManualUploadOptions = {
    branches,
    tags,
    branchOrTagName,
    onBranchOrTagChange: (name, slug, nextIsTag) => {
      setBranchOrTagName(name);
      setBranchOrTagSlug(slug);
      setIsTag(nextIsTag);
    },
    isTag,
    onIsTagChange: setIsTag,
    artifactName,
    onArtifactNameChange: setArtifactNameLocal,
    artifacts,
    selectedArtifact,
    onSelectedArtifactChange: setSelectedArtifact,
    origin,
    onOriginChange: setOrigin,
    onReInit: () => {
      setTimeout(() => api?.reInit && api.reInit(), 0);
    },
  };

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
          onValueChange={(v) => setTab(v as ManualUploadKind)}
          className="w-full"
        >
          <div className="flex">
            <TabsList>
              {UPLOAD_TABS.map((uploadTab) => (
                <TabsTrigger
                  key={uploadTab.value}
                  data-testid={`${uploadTab.value}-tab`}
                  value={uploadTab.value}
                >
                  {uploadTab.value.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {UPLOAD_TABS.map((uploadTab) => (
            <TabsContent
              key={uploadTab.value}
              value={uploadTab.value}
              className="mt-2"
            >
              <ManualUploadTab
                tab={uploadTab}
                fileName={fileNames[uploadTab.value]}
                dropzone={dropzones[uploadTab.value]}
                options={options}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex mt-6 flex-row gap-2 justify-end">
          <Button
            variant="secondary"
            id="manual-integration-back"
            onClick={() => api?.scrollTo(prevIndex)}
            disabled={isUploading}
          >
            Back
          </Button>
          <Button
            disabled={isUploadDisabled || isUploading}
            isSubmitting={isUploading}
            data-testid="manual-integration-continue"
            onClick={async () => {
              setIsUploading(true);
              await handleUpload({
                branchOrTagName,
                branchOrTagSlug,
                isTag,
                artifactName:
                  selectedArtifact || artifactName || "unnamed-artifact",
                // lets mark the first one as default
                isDefault: !isTag && branches.length + tags.length === 0,
                origin,
              });
              setIsUploading(false);
            }}
          >
            {isUploading ? "Scanning your SBOM..." : "Upload"}
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default ManualIntegrationSlide;
