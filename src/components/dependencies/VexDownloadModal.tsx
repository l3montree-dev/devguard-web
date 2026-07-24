import {
  FileCode,
  FileTextIcon,
  GitBranchIcon,
  Loader2Icon,
  PersonStandingIcon,
} from "lucide-react";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { DelayedDownloadButton } from "../common/DelayedDownloadButton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Callout from "../common/Callout";
import { useConfig } from "../../context/ConfigContext";
import { usePublicSharing } from "./PublicUrlSection";
import { useDownloadPdf } from "./useDownloadPdf";
import { ArtifactAndPublicUrlGrid } from "./ArtifactAndPublicUrlGrid";

interface VexDownloadModalProps {
  showVexModal: boolean;
  setShowVexModal: Dispatch<SetStateAction<boolean>>;
  assetName?: string;
  pathname: string;
}

export default function VexDownloadModal({
  showVexModal,
  setShowVexModal,
  assetName,
  pathname,
}: VexDownloadModalProps) {
  const config = useConfig();
  const { sharesInformation, isPublicLoading, handleTogglePublic } =
    usePublicSharing();
  const { isLoading, handleDownload: handleDownloadPdfVex } = useDownloadPdf(
    pathname,
    "vulnerability-report.pdf",
    "VeX PDF",
  );

  const jsonFileName = `${assetName}_vex.json`;
  const xmlFileName = `${assetName}_vex.xml`;

  return (
    <Dialog open={showVexModal}>
      <DialogContent setOpen={setShowVexModal}>
        <DialogHeader>
          <DialogTitle>
            Download VEX File for &quot;{assetName}&quot;{" "}
          </DialogTitle>
          <DialogDescription>
            You can download the VEX (Vulnerability Exploitability eXchange) in
            machine readable formats and an accessible PDF if available.
            <div className="mt-4">
              <Callout intent="neutral">
                <span>
                  <strong>Note:</strong> You can share the standard VEX for this
                  repository. That does not export your VEX Rules.
                </span>
              </Callout>
            </div>
          </DialogDescription>
        </DialogHeader>
        <hr />
        <h4 className="font-semibold mt-4">Machine Readable Formats</h4>
        <p className="text-sm text-muted-foreground">
          The VeX is available in JSON and XML formats. Use these formats to
          integrate with other tools or for further processing.
        </p>
        <div className="flex items-start justify-start gap-4 mt-2">
          <DelayedDownloadButton
            data-testid="download-vex-json-format"
            href={pathname + `/../vex.json`}
            icon={
              <Image
                src="/assets/cyclonedx-logo.svg"
                alt="JSON Logo"
                width={20}
                height={20}
                className="h-5 w-auto inline-block"
              />
            }
            label={"Download in JSON-Format"}
            downloadFileName={jsonFileName}
          />
          <DelayedDownloadButton
            href={pathname + `/../vex.xml`}
            icon={<FileCode className="h-5 w-auto inline-block text-success" />}
            label={"Download in XML-Format"}
            downloadFileName={xmlFileName}
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
          An accessible Vulnerability Report PDF can be generated for the
          artifact. Generation may take some time (
          <strong>up to several minutes</strong>); the download will start
          automatically once ready.
        </p>

        <Button
          onClick={() => handleDownloadPdfVex()}
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="animate-spin h-5 w-auto inline-block mr-2" />
          ) : (
            <>
              <FileTextIcon className="h-5 w-auto inline-block mr-2 text-accent-foreground" />
              <PersonStandingIcon className="h-5 w-auto inline-block text-accent-foreground mr-2" />
            </>
          )}
          Download Vulnerability Report PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
