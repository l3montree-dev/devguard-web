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
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import type { ArtifactDTO } from "../../types/api/api";
import { useSelectArtifact } from "../ArtifactSelector";
import { useConfig } from "../../context/ConfigContext";
import { useActiveAssetVersion } from "../../hooks/useActiveAssetVersion";
import { useActiveAsset } from "../../hooks/useActiveAsset";
import { usePublicSharing } from "./PublicUrlSection";
import { useDownloadPdf } from "./useDownloadPdf";
import { ArtifactAndPublicUrlGrid } from "./ArtifactAndPublicUrlGrid";

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
  const config = useConfig();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  const { sharesInformation, isPublicLoading, handleTogglePublic } =
    usePublicSharing();
  const { isLoading, handleDownload: handleDownloadPdfSbom } = useDownloadPdf(
    pathname,
    "sbom.pdf",
    "SBOM PDF",
  );

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
        <ArtifactAndPublicUrlGrid
          artifacts={artifacts}
          selectedArtifact={selectedArtifact}
          onSelect={setSelectedArtifact}
          sharesInformation={sharesInformation}
          isPublicLoading={isPublicLoading}
          onToggle={handleTogglePublic}
          assetVersionSlug={assetVersion?.slug}
          assetId={asset?.id}
          devguardApiUrl={config.devguardApiUrlPublicInternet}
          fileType="sbom.json"
          toastLabel="SBOM URL"
        />
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
            icon={<FileCode className="h-5 w-auto inline-block text-success" />}
            label={"Download in XML-Format"}
          />
        </div>
        <hr className="mt-6" />
        <h4 className="font-semibold mt-4">
          PDF/UA-Report{" "}
          <span className="ml-2 inline-flex items-center rounded-full bg-accent-muted px-2 py-1 text-xs font-medium text-accent-foreground ring-1 ring-inset ring-accent-ring">
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
          onClick={() => handleDownloadPdfSbom(selectedArtifact)}
          variant="secondary"
          disabled={isLoading}
          aria-label="Download SBOM in PDF/UA format"
        >
          {isLoading ? (
            <Loader2Icon className="animate-spin h-5 w-auto inline-block mr-2" />
          ) : (
            <>
              <FileTextIcon className="h-5 w-auto inline-block mr-2 text-accent-foreground" />
              <PersonStandingIcon className="h-5 w-auto inline-block text-accent-foreground mr-2" />
            </>
          )}
          Download in PDF/UA-Format
        </Button>
      </DialogContent>
    </Dialog>
  );
}
