import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";

import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import usePersonalAccessToken from "../hooks/usePersonalAccessToken";
import {
  browserApiClient,
  multipartBrowserApiClient,
} from "../services/devGuardApi";
import { useAutosetup } from "@/hooks/useAutosetup";
import { useUpdateOrganization } from "../context/OrganizationContext";
import useRepositoryConnection from "../hooks/useRepositoryConnection";
import AutomatedIntegrationSlide from "./guides/risk-scanner-carousel-slides/AutomatedIntegrationSlide";
import AutoSetupProgressSlide from "./guides/risk-scanner-carousel-slides/AutoSetupProgressSlide";
import ExternalEntityAutosetup from "./guides/risk-scanner-carousel-slides/ExternalEntityAutosetup";
import GithubTokenSlide from "./guides/risk-scanner-carousel-slides/GithubTokenSlide";
import GitLabIntegrationSlide from "./guides/risk-scanner-carousel-slides/GitLabIntegrationSlide";
import GitlabTokenSlide from "./guides/risk-scanner-carousel-slides/GitlabTokenSlide";
import IntegrationMethodSelectionSlide from "./guides/risk-scanner-carousel-slides/IntegrationMethodSelectionSlide";
import ManualIntegrationSlide from "./guides/risk-scanner-carousel-slides/ManualIntegrationSlide";
import ProviderSetupSlide from "./guides/risk-scanner-carousel-slides/RepositoryConnectionSlide";
import ScannerOptionsSelectionSlide from "./guides/risk-scanner-carousel-slides/ScannerOptionsSelectionSlide";
import ScannerSelectionSlide from "./guides/risk-scanner-carousel-slides/ScannerSelectionSlide";
import { SetupMethodSelectionSlide } from "./guides/risk-scanner-carousel-slides/SetupMethodSelectionSlide";
import UpdateRepositoryProviderSlide from "./guides/risk-scanner-carousel-slides/UpdateRepositoryProviderSlide";
import YamlGeneratorSlide from "./guides/risk-scanner-carousel-slides/YamlGeneratorSlide";
import SelectRepoSlide from "./guides/webhook-setup-carousel-slides/SelectRepoSlide";
import { Carousel, CarouselApi, CarouselContent } from "./ui/carousel";
import { Dialog, DialogContent } from "./ui/dialog";
import { useRouter } from "next/navigation";
import { ArtifactDTO, AssetVersionDTO } from "@/types/api/api";
import { useUpdateAsset } from "../context/AssetContext";
import { fetchAsset } from "../data-fetcher/fetchAsset";
import { SetupInformationSourceSlide } from "./guides/risk-scanner-carousel-slides/SetupInformationSourceSlide";

interface RiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
  frontendUrl: string;
  devguardCIComponentBase: string;
  assetVersion?: AssetVersionDTO;
  artifacts?: Array<ArtifactDTO>;
}

const RiskScannerDialog: FunctionComponent<RiskScannerDialogProps> = ({
  open,
  apiUrl,
  frontendUrl,
  devguardCIComponentBase,
  onOpenChange,
  assetVersion,
  artifacts,
}) => {
  const [api, setApi] = React.useState<{
    reInit: () => void;
    scrollTo: (index: number) => void;
  }>({
    reInit: () => {},
    scrollTo: () => {},
  });

  const router = useRouter();

  const asset = useActiveAsset()!;

  const [selectedSetup, setSelectedSetup] = React.useState<
    "devguard-tools" | "own-setup" | "information-source" | undefined
  >();

  const [selectedScanner, setSelectedScanner] = React.useState<
    "custom-setup" | "auto-setup" | "information-source" | undefined
  >();

  const [config, setConfig] = React.useState({
    "secret-scanning": true,
    sast: true,
    iac: true,
    sca: true,
    build: true,
    "container-scanning": true,
    push: true,
    sign: true,
    attest: true,
    sbom: false,
    sarif: false,
  });

  // Manual integration state
  const [variant, setVariant] = React.useState<"manual" | "auto">("auto");
  const [tab, setTab] = React.useState<"sbom" | "sarif" | "vex">("sbom");
  const updateOrg = useUpdateOrganization();

  const [sbomFileName, setSbomFileName] = useState<string | undefined>();
  const sbomFileRef = useRef<File | undefined>(undefined);
  const [sarifFileName, setSarifFileName] = useState<string | undefined>();
  const sarifContentRef = useRef<string | undefined>(undefined);
  const [vexFileName, setVexFileName] = useState<string | undefined>();
  const vexContentRef = useRef<string | undefined>(undefined);

  const onDropVex = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const txt = reader.result as string;
          const parsed = JSON.parse(txt);

          if (parsed?.bomFormat === "CycloneDX") {
            vexContentRef.current = txt;
            setVexFileName(file.name);
          } else {
            toast.error(
              "VEX file does not follow CycloneDX format or Version is < 1.6",
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
        const parsed = JSON.parse(sarifContentRef.current || "{}");
        if (!parsed.$schema?.includes("sarif")) {
          toast.error("SARIF file does not follow SARIF format");
          return;
        }

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

  const vexDropzone = useDropzone({
    onDrop: onDropVex,
    accept: {
      "application/json": [".json"],
      "application/sarif+json": [".sarif"],
      "text/plain": [".sarif"],
    },
  });

  const refreshAssetData = async () => {
    // fetch the asset again
    const updatedAsset = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}`,
      { method: "GET" },
    );
    if (updatedAsset.ok) {
      const assetData = await updatedAsset.json();
      updateAsset(assetData);
    }
  };

  const updateAsset = useUpdateAsset();
  const uploadSBOM = async (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => {
    if (!sbomFileRef.current) return;
    const formdata = new FormData();
    formdata.append("file", sbomFileRef.current);

    const resp = await multipartBrowserApiClient(
      `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/${activeProject.slug}/assets/${asset!.slug}/sbom-file`,
      {
        method: "POST",
        body: formdata,
        headers: {
          "X-Asset-Ref": params.branchOrTagName,
          "X-Asset-Default-Branch": params.isDefault
            ? params.branchOrTagName
            : "",
          "X-Tag": params.isTag ? "1" : "0",
          "X-Artifact-Name": params.artifactName,
          "X-Origin": params.origin,
          "X-Asset-Name": `${activeOrg.slug}/${activeProject.slug}/${asset!.slug}`,
        },
      },
    );

    if (resp.ok) {
      await refreshAssetData();
      router.push(
        `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/${params.branchOrTagName}/dependency-risks/`,
      );
      onOpenChange(false);
      toast.success("SBOM has successfully been sent!");
    } else {
      toast.error("SBOM has not been sent successfully");
    }
  };

  const uploadSARIF = async (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => {
    if (!sarifContentRef.current) return;

    const resp = await browserApiClient(`/sarif-scan`, {
      method: "POST",
      body: sarifContentRef.current,
      headers: {
        "X-Tag": params.isTag ? "1" : "0",
        "X-Asset-Ref": params.branchOrTagName,
        "X-Asset-Default-Branch": params.isDefault
          ? params.branchOrTagName
          : "",
        "X-Asset-Name": `${activeOrg.slug}/${activeProject.slug}/${asset!.slug}`,
        "X-Scanner": params.origin,
      },
    });

    if (resp.ok) {
      toast.success("SARIF report has successfully been sent!");
    } else {
      toast.error("SARIF report has not been sent successfully");
    }
    onOpenChange(false);
    router.push(
      `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/main/code-risks/`,
    );
  };

  const uploadVEX = async (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => {
    if (!vexContentRef.current) return;

    const resp = await browserApiClient(`/vex`, {
      method: "POST",
      body: vexContentRef.current,
      headers: {
        "X-Tag": params.isTag ? "1" : "0",
        "X-Asset-Ref": params.branchOrTagName,
        "X-Artifact-Name": params.artifactName,
        "X-Asset-Default-Branch": params.isDefault
          ? params.branchOrTagName
          : "",
        "X-Asset-Name": `${activeOrg.slug}/${activeProject.slug}/${asset!.slug}`,
        "X-Origin": params.origin,
      },
    });

    if (resp.ok) {
      await refreshAssetData();
      toast.success("VEX has successfully been sent!");
    } else {
      toast.error("VEX has not been sent successfully");
    }
    onOpenChange(false);
    router.push(
      `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/${params.branchOrTagName}/dependency-risks/`,
    );
  };

  const handleInformationSourceSetup = async (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    informationSources: Array<string>;
  }) => {
    // first create the asset version
    const resp = await browserApiClient(
      `/organizations/${decodeURIComponent(
        activeOrg.slug,
      )}/projects/${activeProject.slug}/assets/${asset!.slug}/refs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: params.branchOrTagName,
          tag: params.isTag,
          defaultBranch: params.isDefault,
        }),
      },
    );

    // now create the artifact
    if (resp.ok) {
      const assetVersionData = await resp.json();
      const artifactResp = await browserApiClient(
        `/organizations/${decodeURIComponent(
          activeOrg.slug,
        )}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/${assetVersionData.slug}/artifacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artifactName: params.artifactName,
            informationSources: params.informationSources,
          }),
        },
      );
      if (artifactResp.ok) {
        toast.success("Information source setup successfully created!");
        router.push(
          `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/${assetVersionData.slug}/dependency-risks/`,
        );
        onOpenChange(false);
      } else {
        toast.error("Artifact could not be created successfully");
      }
    }
  };

  const handleUpload = (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    origin: string;
  }) => {
    if (tab === "sbom") {
      uploadSBOM(params);
    } else if (tab === "sarif") {
      uploadSARIF(params);
    } else {
      uploadVEX(params);
    }
  };

  const activeOrg = useActiveOrg()!;
  const activeProject = useActiveProject()!;

  const pat = usePersonalAccessToken();
  const [timedOut, setTimedOut] = React.useState(false);

  const autosetup = useAutosetup(open, apiUrl, "full");

  const { repositories, selectedProvider, isLoadingRepositories } =
    useRepositoryConnection();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (autosetup.isLoading) {
        toast.error(
          "The auto-setup is taking longer than expected. Please try again later.",
        );
        setTimedOut(true);
      }
    }, 18000);

    return () => clearTimeout(timer);
  }, [autosetup.isLoading]);

  const isReallyLoading = autosetup.isLoading && !timedOut;

  useEffect(() => {
    api?.reInit();
  }, [selectedScanner, pat.pat, api, config]);

  const getStartIndex = () => {
    // display the update repository provider slide if asset is not connected already
    if (!asset.externalEntityId && !asset.repositoryProvider) {
      return 0; // start with the update repository provider slide
    }
    if (asset.repositoryProvider === "github") {
      // we can skip setup method selection slide - and the whole autosetup slides
      return 6;
    }

    return 1;
  };

  const indexAfterUpdateRepoProvider = () => {
    // if the asset is connected to a github repository, there is only a single method to setup: custom. There is no autosetup option at all. Therefore skip the setup method selection slide. We do not need to show the gitlab integration slide either - thus index 3.
    return asset.repositoryProvider === "github" ? 3 : 1;
  };

  const getAutosetupSlideIndex = () => {
    if (asset.externalEntityProviderId) {
      return 14;
    }
    // skip the gitlab integration slide if we have integrations, otherwise show it
    return activeOrg.gitLabIntegrations.length > 0 ? 3 : 2;
  };

  // save the slide history to make the back button implementation easier
  const [slideHistory, setSlideHistory] = useState<number[]>([getStartIndex()]);

  const prevIndex = slideHistory[slideHistory.length - 2] || 0;

  const setProxyApi = useCallback((api: CarouselApi) => {
    return setApi({
      reInit: api ? api.reInit : () => {},
      scrollTo: (index: number) => {
        api?.scrollTo(index);
        // if the current slide is not in the history, update the history
        setSlideHistory((prev) => {
          // check if the previous slide is already in the history
          if (prev.includes(index)) {
            return prev.slice(0, prev.lastIndexOf(index) + 1);
          }
          return [...prev, index];
        });
      },
    });
  }, []);

  const isUploadDisabled =
    tab === "sbom"
      ? !sbomFileName
      : tab === "sarif"
        ? !sarifFileName
        : !vexFileName;
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <Carousel
          opts={{
            watchDrag: false,
            containScroll: false,
            startIndex: getStartIndex(),
          }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setProxyApi}
        >
          <CarouselContent>
            {/** Only needed if asset is not connected already */}
            <UpdateRepositoryProviderSlide
              nextIndex={indexAfterUpdateRepoProvider()}
              api={api}
            />
            <SetupMethodSelectionSlide
              api={api}
              asset={asset!}
              selectScannerSlideIndex={6}
              setupInformationSourceSlideIndex={15}
              autosetupSlideIndex={getAutosetupSlideIndex()} // if we have integrations, present the user directly the provider setup slide. If no, present the gitlab integration slide and SKIP the provider setup slide
              selectedScanner={selectedScanner}
              setSelectedScanner={setSelectedScanner}
            />
            <GitLabIntegrationSlide
              org={activeOrg}
              updateOrg={(v) =>
                updateOrg((prev) => ({ ...prev, organization: v }))
              }
              api={api}
              selectRepoSlideIndex={4}
              prevIndex={prevIndex}
            />
            <ProviderSetupSlide
              selectedProvider={selectedProvider}
              api={api}
              selectRepoSlideIndex={4}
              providerIntegrationSlideIndex={2}
              org={activeOrg}
              prevIndex={prevIndex}
              isLoadingRepositories={isLoadingRepositories}
            />
            <SelectRepoSlide
              api={api}
              repositoryName={asset.repositoryName}
              repositoryId={asset.repositoryId}
              repositories={repositories}
              afterSuccessfulConnectionSlideIndex={5}
              prevIndex={prevIndex}
            />
            <AutoSetupProgressSlide
              asset={asset!}
              handleAutosetup={autosetup.handleAutosetup}
              progress={autosetup.progress}
              Loader={autosetup.Loader}
              isReallyLoading={isReallyLoading}
              api={api}
              onClose={() => onOpenChange(false)}
              prevIndex={prevIndex}
            />
            <ScannerSelectionSlide
              api={api}
              selectedSetup={selectedSetup}
              setSelectedSetup={setSelectedSetup}
              prevIndex={prevIndex}
              informationSourceSlideIndex={15}
              devguardToolsSlideIndex={7}
              customSetupSlideIndex={11}
            />
            <ScannerOptionsSelectionSlide
              config={config}
              setConfig={setConfig}
              api={api}
              tokenSlideIndex={asset.repositoryProvider === "github" ? 8 : 9}
              prevIndex={prevIndex}
            />
            <GithubTokenSlide
              pat={pat.pat?.privKey}
              api={api}
              apiUrl={apiUrl}
              orgSlug={activeOrg.slug}
              projectSlug={activeProject.slug}
              assetSlug={asset!.slug}
              config={config}
              yamlGeneratorSlideIndex={10}
              prevIndex={prevIndex}
            />
            <GitlabTokenSlide
              pat={pat.pat?.privKey}
              api={api}
              apiUrl={apiUrl}
              orgSlug={activeOrg.slug}
              yamlGeneratorSlideIndex={10}
              prevIndex={prevIndex}
              projectSlug={activeProject.slug}
              assetSlug={asset!.slug}
              config={config}
            />
            <YamlGeneratorSlide
              gitInstance={
                asset?.repositoryProvider === "github" ? "GitHub" : "Gitlab"
              }
              config={config}
              orgSlug={activeOrg.slug}
              projectSlug={activeProject.slug}
              assetSlug={asset!.slug}
              apiUrl={apiUrl}
              frontendUrl={frontendUrl}
              devguardCIComponentBase={devguardCIComponentBase}
              activeOrg={activeOrg}
              activeProject={activeProject}
              asset={asset || null}
              onClose={() => onOpenChange(false)}
              api={api}
              prevIndex={prevIndex}
            />
            <IntegrationMethodSelectionSlide
              variant={variant}
              setVariant={setVariant}
              api={api}
              prevIndex={prevIndex}
              cliSlideIndex={12}
              fileUploadSlideIndex={13}
            />
            <AutomatedIntegrationSlide
              apiUrl={apiUrl}
              orgSlug={activeOrg.slug}
              projectSlug={activeProject.slug}
              assetSlug={asset!.slug}
              prevIndex={prevIndex}
              onClose={() => onOpenChange(false)}
              api={api}
            />
            <ManualIntegrationSlide
              tab={tab}
              setTab={setTab}
              sbomFileName={sbomFileName}
              sarifFileName={sarifFileName}
              sbomDropzone={sbomDropzone}
              sarifDropzone={sarifDropzone}
              isUploadDisabled={isUploadDisabled}
              vexDropzone={vexDropzone}
              vexFileName={vexFileName}
              handleUpload={handleUpload}
              prevIndex={prevIndex}
              onClose={() => onOpenChange(false)}
              api={api}
              assetVersionName={assetVersion?.name}
              artifacts={artifacts || []}
            />
            <ExternalEntityAutosetup
              handleAutosetup={autosetup.handleAutosetup}
              progress={autosetup.progress}
              Loader={autosetup.Loader}
              isReallyLoading={isReallyLoading}
              api={api}
              prevIndex={prevIndex}
              onClose={() => onOpenChange(false)}
            />
            <SetupInformationSourceSlide
              api={api}
              prevIndex={prevIndex}
              onInformationSourceSetup={handleInformationSourceSetup}
            />
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScannerDialog;
