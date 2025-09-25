import {
  FileCode,
  FileTextIcon,
  GitBranchIcon,
  Loader2Icon,
  PersonStandingIcon,
} from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { ArtifactDTO } from "../../types/api/api";
import { SimpleArtifactSelector, useSelectArtifact } from "../ArtifactSelector";
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

interface VexDownloadModalProps {
  showVexModal: boolean;
  setShowVexModal: Dispatch<SetStateAction<boolean>>;
  assetName?: string;
  assetVersionName?: string;
  pathname: string;
  artifacts: Array<ArtifactDTO>;
}

export default function VexDownloadModal({
  showVexModal,
  setShowVexModal,
  assetName,
  assetVersionName,
  pathname,
  artifacts,
}: VexDownloadModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdfVex = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        pathname +
          `/../vulnerability-report.pdf?${new URLSearchParams({
            artifact: selectedArtifact || "",
          })}`,
        {
          signal: AbortSignal.timeout(60 * 8 * 1000), // 8 minutes timeout
          method: "GET",
        },
      );
      if (!response.ok) {
        setIsLoading(false);
        toast.error("Failed to download VeX PDF. Please try again later.");
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
      toast.error("Failed to download VeX PDF. Please try again later.");
    }
  };

  const { selectedArtifact, setSelectedArtifact } = useSelectArtifact(
    false,
    (artifacts ?? []).map((a) => a.artifactName),
  );

  return (
    <Dialog open={showVexModal}>
      <DialogContent setOpen={setShowVexModal}>
        <DialogHeader>
          <DialogTitle>
            Download VeX for &quot;{assetName}&quot;{" "}
            <Badge variant={"outline"} className="ml-1">
              <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
              {assetVersionName}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            You can download the VeX (Vulnerability Exploitability eXchange) in
            machine readable formats and an accessible PDF if available.
          </DialogDescription>
        </DialogHeader>
        <div>
          <hr />
          <h4 className="font-semibold mt-4">Artifact</h4>
          <p className="text-sm mb-4 text-muted-foreground">
            Select the artifact for which you want to download the VeX.
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
          The VeX is available in JSON and XML formats. Use these formats to
          integrate with other tools or for further processing.
        </p>
        <div className="flex items-start justify-start gap-4 mt-2">
          <DelayedDownloadButton
            href={
              pathname +
              `/../vex.json?${new URLSearchParams({
                artifact: selectedArtifact as string,
              })}`
            }
            format={"json"}
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
          />
          <DelayedDownloadButton
            href={
              pathname +
              `/../vex.xml?${new URLSearchParams({
                artifact: selectedArtifact as string,
              })}`
            }
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
          <span className="ml-2 inline-flex items-center rounded-full bg-purple-800/30 px-2 py-1 text-xs font-medium dark:text-purple-300 ring-1 ring-inset ring-purple-600/50 text-black-500">
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
          onClick={handleDownloadPdfVex}
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
          Download Vulnerability Report PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
