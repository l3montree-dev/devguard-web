import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import router from "next/router";
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

import useRepositoryConnection from "../hooks/useRepositoryConnection";
import { useStore } from "../zustand/globalStoreProvider";
import AutomatedIntegrationSlide from "./guides/risk-scanner-carousel-slides/AutomatedIntegrationSlide";
import AutoSetupProgressSlide from "./guides/risk-scanner-carousel-slides/AutoSetupProgressSlide";
import GithubTokenSlide from "./guides/risk-scanner-carousel-slides/GithubTokenSlide";
import GitLabIntegrationSlide from "./guides/risk-scanner-carousel-slides/GitLabIntegrationSlide";
import GitlabTokenSlide from "./guides/risk-scanner-carousel-slides/GitlabTokenSlide";
import IntegrationMethodSelectionSlide from "./guides/risk-scanner-carousel-slides/IntegrationMethodSelectionSlide";
import ManualIntegrationSlide from "./guides/risk-scanner-carousel-slides/ManualIntegrationSlide";
import RepositoryConnectionSlide from "./guides/risk-scanner-carousel-slides/RepositoryConnectionSlide";
import ScannerOptionsSelectionSlide from "./guides/risk-scanner-carousel-slides/ScannerOptionsSelectionSlide";
import ScannerSelectionSlide from "./guides/risk-scanner-carousel-slides/ScannerSelectionSlide";
import { SetupMethodSelectionSlide } from "./guides/risk-scanner-carousel-slides/SetupMethodSelectionSlide";
import YamlGeneratorSlide from "./guides/risk-scanner-carousel-slides/YamlGeneratorSlide";
import SelectRepoSlide from "./guides/webhook-setup-carousel-slides/SelectRepoSlide";
import { Carousel, CarouselApi, CarouselContent } from "./ui/carousel";
import { Dialog, DialogContent } from "./ui/dialog";

interface RiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

const RiskScannerDialog: FunctionComponent<RiskScannerDialogProps> = ({
  open,
  apiUrl,
  onOpenChange,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();

  const asset = useActiveAsset()!;

  const [selectedSetup, setSelectedSetup] = React.useState<
    "cherry-pick-setup" | "own-setup" | undefined
  >();

  const [selectedScanner, setSelectedScanner] = React.useState<
    "custom-setup" | "auto-setup" | undefined
  >();

  const [config, setConfig] = React.useState({
    "secret-scanning": true,
    sca: true,
    "container-scanning": true,
    sast: true,
    iac: true,
    build: true,
  });

  // Manual integration state
  const [variant, setVariant] = React.useState<"manual" | "auto">("auto");
  const [tab, setTab] = React.useState<"sbom" | "sarif">("sbom");
  const updateOrg = useStore((s) => s.updateOrganization);

  const [sbomFileName, setSbomFileName] = useState<string | undefined>();
  const sbomFileRef = useRef<File | undefined>(undefined);
  const [sarifFileName, setSarifFileName] = useState<string | undefined>();
  const sarifContentRef = useRef<string | undefined>(undefined);

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
      `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/sbom-file`,
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
      `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/main/dependency-risks/`,
    );
  };

  const uploadSARIF = async () => {
    if (!sarifContentRef.current) return;

    const resp = await browserApiClient(`/sarif-scan`, {
      method: "POST",
      body: sarifContentRef.current,
      headers: {
        "X-Scanner": "SARIF-File-Upload",
        "X-Asset-Name": `${activeOrg.slug}/${activeProject.slug}/${asset!.slug}`,
      },
    });

    if (resp.ok) {
      toast.success("SARIF report has successfully been sent!");
    } else {
      toast.error("SARIF report has not been sent successfully");
    }
    router.push(
      `/${activeOrg.slug}/projects/${activeProject.slug}/assets/${asset!.slug}/refs/main/code-risks/`,
    );
  };

  const isUploadDisabled = tab === "sbom" ? !sbomFileName : !sarifFileName;
  const handleUpload = () => (tab === "sbom" ? uploadSBOM() : uploadSARIF());

  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();

  const pat = usePersonalAccessToken();
  const [timedOut, setTimedOut] = React.useState(false);

  const autosetup = useAutosetup("full");

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
  }, [selectedScanner, pat.pat, api]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <Carousel
          opts={{
            watchDrag: false,
            containScroll: false,
          }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setApi}
        >
          <CarouselContent>
            <SetupMethodSelectionSlide
              api={api}
              asset={asset!}
              selectedScanner={selectedScanner}
              setSelectedScanner={setSelectedScanner}
            />

            {selectedScanner === "auto-setup" && (
              <>
                <RepositoryConnectionSlide
                  selectedProvider={selectedProvider}
                  api={api}
                  nextIndex={2}
                  prevIndex={1}
                  org={activeOrg}
                  isLoadingRepositories={isLoadingRepositories}
                />
                <GitLabIntegrationSlide
                  org={activeOrg}
                  updateOrg={updateOrg}
                  api={api}
                  nextIndex={3}
                  prevIndex={2}
                />
                <SelectRepoSlide
                  api={api}
                  repositoryName={asset.repositoryName}
                  repositoryId={asset.repositoryId}
                  repositories={repositories}
                  webhookSetupSlideIndex={4}
                  prevIndex={3}
                />
                <AutoSetupProgressSlide
                  asset={asset!}
                  handleAutosetup={autosetup.handleAutosetup}
                  progress={autosetup.progress}
                  Loader={autosetup.Loader}
                  isReallyLoading={isReallyLoading}
                  api={api}
                  nextIndex={0}
                  prevIndex={4}
                />
              </>
            )}
            <ScannerSelectionSlide
              api={api}
              selectedSetup={selectedSetup}
              setSelectedSetup={setSelectedSetup}
              setSelectedScanner={setSelectedScanner}
              selectedScanner={selectedScanner}
            />

            {selectedSetup === "cherry-pick-setup" && (
              <>
                <ScannerOptionsSelectionSlide
                  config={config}
                  setConfig={setConfig}
                  api={api}
                />
                {asset?.repositoryProvider === "github" && (
                  <GithubTokenSlide
                    pat={pat.pat?.privKey}
                    api={api}
                    apiUrl={apiUrl}
                    orgSlug={activeOrg.slug}
                    projectSlug={activeProject.slug}
                    assetSlug={asset!.slug}
                    config={config}
                  />
                )}
                {asset?.repositoryProvider === "gitlab" && (
                  <GitlabTokenSlide
                    pat={pat.pat?.privKey}
                    api={api}
                    apiUrl={apiUrl}
                    orgSlug={activeOrg.slug}
                    projectSlug={activeProject.slug}
                    assetSlug={asset!.slug}
                    config={config}
                  />
                )}
                <YamlGeneratorSlide
                  gitInstance={
                    asset?.repositoryProvider === "github" ? "GitHub" : "Gitlab"
                  }
                  config={config}
                  orgSlug={activeOrg.slug}
                  projectSlug={activeProject.slug}
                  assetSlug={asset!.slug}
                  apiUrl={apiUrl}
                  activeOrg={activeOrg}
                  activeProject={activeProject}
                  asset={asset || null}
                  api={api}
                />
              </>
            )}
            {selectedSetup === "own-setup" && (
              <>
                <IntegrationMethodSelectionSlide
                  variant={variant}
                  setVariant={setVariant}
                  api={api}
                />
                {variant === "auto" && (
                  <AutomatedIntegrationSlide
                    pat={pat}
                    apiUrl={apiUrl}
                    orgSlug={activeOrg.slug}
                    projectSlug={activeProject.slug}
                    assetSlug={asset!.slug}
                    tab={tab}
                    setTab={setTab}
                    api={api}
                  />
                )}
                {variant === "manual" && (
                  <ManualIntegrationSlide
                    tab={tab}
                    setTab={setTab}
                    sbomFileName={sbomFileName}
                    sarifFileName={sarifFileName}
                    sbomDropzone={sbomDropzone}
                    sarifDropzone={sarifDropzone}
                    isUploadDisabled={isUploadDisabled}
                    handleUpload={handleUpload}
                    api={api}
                  />
                )}
              </>
            )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScannerDialog;
