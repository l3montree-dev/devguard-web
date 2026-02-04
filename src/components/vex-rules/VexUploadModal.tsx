import { FunctionComponent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import FileUpload from "../FileUpload";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { BranchTagSelector } from "../BranchTagSelector";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { documentationLinks } from "@/const/documentationLinks";
import { useDropzone } from "react-dropzone";

interface VexUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (params: {
    file: File;
    branchOrTagName: string;
    branchOrTagSlug: string;
    isTag: boolean;
  }) => Promise<void>;
}

const VexUploadModal: FunctionComponent<VexUploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
}) => {
  const { branches, tags } = useAssetBranchesAndTags();

  const [branchOrTagName, setBranchOrTagName] = useState("");
  const [branchOrTagSlug, setBranchOrTagSlug] = useState("");
  const [isTag, setIsTag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [vexFile, setVexFile] = useState<File | null>(null);

  // Initialize branch/tag from URL or default to main
  useEffect(() => {
    if (branches.length > 0) {
      const defaultBranch = branches[0];
      setBranchOrTagName(defaultBranch.name);
      setBranchOrTagSlug(defaultBranch.slug);
      setIsTag(false);
    } else if (tags.length > 0) {
      const defaultTag = tags[0];
      setBranchOrTagName(defaultTag.name);
      setBranchOrTagSlug(defaultTag.slug);
      setIsTag(true);
    }
  }, [branches, tags, open]);

  const vexDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVexFile(acceptedFiles[0]);
      }
    },
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  const handleUploadClick = async () => {
    if (!vexFile) return;

    setIsUploading(true);
    try {
      await onUpload({
        file: vexFile,
        branchOrTagName,
        branchOrTagSlug,
        isTag,
      });
      // Reset form
      setVexFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isUploadDisabled = !vexFile || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload VEX File</DialogTitle>
          <DialogDescription>
            Upload a VEX file in CycloneDX 1.6 or higher (JSON) to add
            vulnerability exploitability information.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="mb-2 block">Branch/Tag</Label>
            <BranchTagSelector
              branches={branches}
              tags={tags}
              disableNavigateToRefInsteadCall={(v) => {
                setBranchOrTagName(v.name);
                setBranchOrTagSlug(v.slug);
                setIsTag(v.type === "tag");
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">VEX File</CardTitle>
              <CardDescription>
                Select a VEX file in CycloneDX format (JSON)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                id="file-upload-vex"
                files={vexFile ? [vexFile.name] : []}
                dropzone={vexDropzone}
              />
            </CardContent>
          </Card>

          <div className="flex text-primary flex-row items-center">
            <QuestionMarkCircleIcon className="flex w-4 m-2 text-primary" />
            <Link
              className="flex text-primary text-sm"
              href={documentationLinks.vexExplaining}
              target="_blank"
            >
              What is VEX?
            </Link>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isUploadDisabled}
              isSubmitting={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload VEX"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VexUploadModal;
