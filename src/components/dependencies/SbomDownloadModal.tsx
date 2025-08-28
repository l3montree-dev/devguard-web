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
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArtifactDTO } from "../../types/api/api";
import {
  QueryArtifactSelector,
  SimpleArtifactSelector,
  useSelectArtifact,
} from "../ArtifactSelector";

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
        <div>
          <hr />
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
        <hr />
        <h4 className="font-semibold mt-4">Machine Readable Formats</h4>
        <p className="text-sm text-muted-foreground">
          The SBOM is available in CycloneDX JSON and XML format. You can use
          these formats to integrate with other tools or for further processing.
        </p>
        <div className="flex items-start justify-start gap-4 mt-2">
          <DelayedDownloadButton
            href={pathname + `/../sbom.json`}
            format={"json"}
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
            href={pathname + `/../sbom.xml`}
            format={"xml"}
            icon={
              <FileCode className="h-5 w-auto inline-block text-green-500" />
            }
            label={"Download in XML-Format"}
          />
        </div>
        <hr className="mt-6" />
        <h4 className="font-semibold mt-4">
          PDF/UA-Report{" "}
          <span className="ml-2 inline-flex items-center rounded-full bg-purple-800/30 px-2 py-1 text-xs font-medium text-purple-300 ring-1 ring-inset ring-purple-600/50">
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
