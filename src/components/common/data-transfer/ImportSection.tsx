// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import ListItem from "@/components/common/ListItem";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { readErrorMessage } from "@/services/apiClient";
import { importArchive } from "@/services/dataTransferService";
import { type FunctionComponent, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  title: string;
  description: string;
  importPath: string;
}

const ImportSection: FunctionComponent<Props> = ({
  title,
  description,
  importPath,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const dropzone = useDropzone({
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0] ?? null),
    accept: { "application/x-tar": [".tar"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    try {
      const resp = await importArchive(importPath, file);
      if (!resp.ok) {
        toast.error(
          "Import has not been successful. Reason: " +
            (await readErrorMessage(resp)),
        );
        return;
      }
      toast.success("Import has been successful!");
      setFile(null);
    } catch {
      toast.error("Import has not been successful");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ListItem
      Title={title}
      Description={description}
      Button={
        <Alert
          title={`Are you sure to import ${file?.name}?`}
          description={description}
          onConfirm={handleImport}
        >
          <Button variant="outline" disabled={!file} isSubmitting={isImporting}>
            Import
          </Button>
        </Alert>
      }
    >
      <FileUpload
        dropzone={dropzone}
        files={file ? [file.name] : []}
        variant="onCard"
      />
    </ListItem>
  );
};

export default ImportSection;
