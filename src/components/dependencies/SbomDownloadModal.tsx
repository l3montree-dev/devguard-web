import {
  GitBranchIcon,
  FileCode,
  FileTextIcon,
  PersonStandingIcon,
  Loader2Icon,
} from "lucide-react";
import { DelayedDownloadButton } from "../common/DelayedDownloadButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import Link from "next/link";
import type { ArtifactDTO } from "../../types/api/api";
import {
  QueryArtifactSelector,
  SimpleArtifactSelector,
  useSelectArtifact,
} from "../ArtifactSelector";
import { Switch } from "../ui/switch";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useActiveAsset } from "../../hooks/useActiveAsset";
import { useUpdateAsset } from "../../context/AssetContext";
import { useConfig } from "../../context/ConfigContext";
import { useActiveAssetVersion } from "../../hooks/useActiveAssetVersion";
import { browserApiClient } from "../../services/devGuardApi";

function SbomPublicUrlBox({
  sharesInformation,
  selectedArtifact,
  assetVersionSlug,
  assetId,
  devguardApiUrl,
}: {
  sharesInformation: boolean;
  selectedArtifact?: string;
  assetVersionSlug?: string;
  assetId?: string;
  devguardApiUrl: string;
}) {
  const handleCopy = () => {
    const displayUrl =
      selectedArtifact && assetVersionSlug && assetId
        ? `${devguardApiUrl}/api/v1/public/${assetId}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}/sbom.json/`
        : "";
    navigator.clipboard.writeText(displayUrl);
    toast("Copied to clipboard", {
      description: "The SBOM-URL has been copied to your clipboard.",
    });
  };

  const displayUrl =
    selectedArtifact && assetVersionSlug && assetId
      ? `${devguardApiUrl}/api/v1/public/${assetId}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}/sbom.json/`
      : "";

  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border dark:border-foreground/20 bg-background px-3 py-2 text-sm transition-opacity ${!sharesInformation ? "opacity-40" : ""}`}
    >
      <span className="truncate text-foreground flex-1 min-w-0">
        {displayUrl}
      </span>
      {sharesInformation && displayUrl && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-2 shrink-0 cursor-pointer transition-all hover:opacity-100"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface SbomDownloadModalProps {
  showSBOMModal: boolean;
  setShowSBOMModal: Dispatch<SetStateAction<boolean>>;
  assetName?: string;
  assetVersionName?: string;
  pathname: string;
  artifacts: Array<ArtifactDTO>;
}

export default function SbomDownloadModal({
  showSBOMModal,
  setShowSBOMModal,
  assetName,
  assetVersionName,
  pathname,
  artifacts,
}: SbomDownloadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = useConfig();
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  const updateAsset = useUpdateAsset();
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  const sharesInformation = asset?.sharesInformation ?? false;

  const handleTogglePublic = async (value: boolean) => {
    setIsPublicLoading(true);
    try {
      const resp = await browserApiClient(
        `/organizations/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}`,
        {
          method: "PATCH",
          body: JSON.stringify({ sharesInformation: value }),
        },
      );
      if (resp.ok) {
        const updated = await resp.json();
        updateAsset(updated);
      } else {
        toast.error("Failed to update public access setting.");
      }
    } catch {
      toast.error("Failed to update public access setting.");
    } finally {
      setIsPublicLoading(false);
    }
  };

  const handleDownloadPdfSbom = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        pathname +
          `/../sbom.pdf?${new URLSearchParams({
            artifact: selectedArtifact || "",
          })}`,
        {
          signal: AbortSignal.timeout(60 * 8 * 1000), // 8 minutes timeout
          method: "GET",
        },
      );
      if (!response.ok) {
        setIsLoading(false);
        toast.error("Failed to download SBOM PDF. Please try again later.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to download SBOM PDF. Please try again later.");
    }
  };

  const { selectedArtifact, setSelectedArtifact } = useSelectArtifact(
    false,
    (artifacts ?? []).map((a) => a.artifactName),
  );

  return (
    <Dialog open={showSBOMModal}>
      <DialogContent setOpen={setShowSBOMModal}>
        <DialogHeader>
          <DialogTitle>
            Download SBOM for &quot;{assetName}&quot;{" "}
            <Badge variant={"outline"} className="ml-1">
              <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
              {assetVersionName}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            You can download the SBOM in JSON, XML or accessible PDF/UA format.
            The SBOM contains all components and their licenses used in this
            asset version.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="grid grid-cols-2 gap-4 space-between">
          <div className="pr-6">
            <h4 className="font-semibold mt-4">Artifact</h4>
            <p className="text-sm mb-4 text-muted-foreground">
              Select the artifact for which you want to download the SBOM.
            </p>
            <SimpleArtifactSelector
              unassignPossible={false}
              artifacts={(artifacts ?? []).map((a) => a.artifactName)}
              selectedArtifact={selectedArtifact}
              onSelect={setSelectedArtifact}
            />
          </div>
          <div className="pl-4">
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="font-semibold">Public URL</span>
              <Switch
                checked={sharesInformation}
                onCheckedChange={handleTogglePublic}
                disabled={isPublicLoading}
                className="scale-75 origin-right"
              />
            </div>
            <p className="text-sm mb-4 text-muted-foreground">
              You can share your SBOM URL for the selected artifact.
            </p>
            <SbomPublicUrlBox
              sharesInformation={sharesInformation}
              selectedArtifact={selectedArtifact}
              assetVersionSlug={assetVersion?.slug}
              assetId={asset?.id}
              devguardApiUrl={config.devguardApiUrlPublicInternet}
            />
          </div>
        </div>
        <hr />
        <h4 className="font-semibold mt-4">Machine Readable Formats</h4>
        <p className="text-sm text-muted-foreground">
          The SBOM is available in CycloneDX JSON and XML format. You can use
          these formats to integrate with other tools or for further processing.
        </p>
        <div className="flex items-start justify-start gap-4 mt-2">
          <DelayedDownloadButton
            href={
              pathname +
              `/../sbom.json?${new URLSearchParams({
                artifact: selectedArtifact || "",
              })}`
            }
            icon={
              <Image
                src="/assets/cyclonedx-logo.svg"
                alt="CycloneDX Logo"
                width={20}
                height={20}
                className="h-5 w-auto inline-block"
              />
            }
            label={"Download in JSON-Format"}
          />
          <DelayedDownloadButton
            href={
              pathname +
              `/../sbom.xml?${new URLSearchParams({
                artifact: selectedArtifact || "",
              })}`
            }
            icon={
              <FileCode className="h-5 w-auto inline-block text-green-500" />
            }
            label={"Download in XML-Format"}
          />
        </div>
        <hr className="mt-6" />
        <h4 className="font-semibold mt-4">
          PDF/UA-Report{" "}
          <span className="ml-2 inline-flex items-center rounded-full bg-purple-800/30 px-2 py-1 text-xs font-medium text-purple-500 ring-1 ring-inset ring-purple-600/50">
            Beta
          </span>
        </h4>
        <p className="text-sm text-muted-foreground">
          The SBOM is also available in an accessible PDF/UA format. This format
          is suitable for human consumption and can be used for reporting
          purposes. Generation is based on the{" "}
          <Link
            href="https://opencode.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            openCode
          </Link>
          {" Community Project "}
          <Link
            href="https://gitlab.opencode.de/open-code/document-writing-tools"
            target="_blank"
            rel="noopener noreferrer"
          >
            Document Writing Tools
          </Link>
          .
        </p>
        <p className="text-sm text-muted-foreground">
          Please note that creating the accessible PDF/UA format can take some
          time (<span className="font-bold">up to several minutes</span>), so
          please be patient. The download will start automatically once the PDF
          is ready.
        </p>

        <Button
          onClick={handleDownloadPdfSbom}
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="animate-spin h-5 w-auto inline-block mr-2" />
          ) : (
            <>
              <FileTextIcon className="h-5 w-auto inline-block mr-2 text-purple-500" />
              <PersonStandingIcon className="h-5 w-auto inline-block text-purple-500 mr-2" />
            </>
          )}
          Download in PDF/UA-Format
        </Button>
      </DialogContent>
    </Dialog>
  );
}
