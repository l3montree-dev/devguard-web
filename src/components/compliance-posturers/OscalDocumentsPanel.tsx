// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import FileUpload from "@/components/FileUpload";
import ListItem from "@/components/common/ListItem";
import { Badge } from "@/components/ui/badge";
import { AsyncButton, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  OscalDocumentEntry,
  OscalDocumentOrigin,
} from "@/hooks/useOscalDocuments";
import { toast } from "@/lib/toast";
import type { DefaultOscalDocument } from "@/services/oscalDocumentService";
import type { FunctionComponent, ReactNode } from "react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

const inheritedLabel: Record<Exclude<OscalDocumentOrigin, "own">, string> = {
  organization: "Inherited from the organization",
  project: "Inherited from a project",
  asset: "Inherited from the repository",
};

interface Props {
  description: string;
  // e.g. "catalog", used in messages
  documentLabel: string;
  defaults: DefaultOscalDocument[];
  entries: OscalDocumentEntry[];
  isLoading: boolean;
  onActivateDefault: (document: DefaultOscalDocument) => Promise<void>;
  // the name of an uploaded document is the title of the document
  onUpload: (document: unknown) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  // rendered below the description, e.g. a link to a page with more details
  headerAction?: ReactNode;
}

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Please try again later.";

// Lists the default and uploaded OSCAL documents of a scope and lets admins
// activate, upload and remove them.
const OscalDocumentsPanel: FunctionComponent<Props> = ({
  description,
  documentLabel,
  defaults,
  entries,
  isLoading,
  onActivateDefault,
  onUpload,
  onDelete,
  headerAction,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const dropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    accept: { "application/json": [".json"] },
    maxFiles: 1,
  });

  const entryByName = new Map(entries.map((e) => [e.name, e]));
  const defaultNames = new Set(defaults.map((d) => d.name));
  const customEntries = entries.filter((e) => !defaultNames.has(e.name));

  const handleActivate = async (document: DefaultOscalDocument) => {
    try {
      await onActivateDefault(document);
      toast.success(`${document.name} activated`);
    } catch (e) {
      toast.error(`Could not activate ${document.name}`, {
        description: errorMessage(e),
      });
    }
  };

  const handleDelete = async (documentName: string) => {
    try {
      await onDelete(documentName);
      toast.success(`${documentName} removed`);
    } catch (e) {
      toast.error(`Could not remove ${documentName}`, {
        description: errorMessage(e),
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    let document: unknown;
    try {
      document = JSON.parse(await file.text());
    } catch {
      toast.error(`The ${documentLabel} is not valid JSON`);
      return;
    }
    try {
      await onUpload(document);
      toast.success(`${file.name} uploaded`);
      setFile(null);
    } catch (e) {
      toast.error(`Could not upload the ${documentLabel}`, {
        description: errorMessage(e),
      });
    }
  };

  const renderAction = (
    entry: OscalDocumentEntry | undefined,
    documentName: string,
    defaultDocument?: DefaultOscalDocument,
  ) => {
    if (entry && entry.origin !== "own") {
      return <Badge variant="secondary">{inheritedLabel[entry.origin]}</Badge>;
    }
    if (entry) {
      return (
        <AuthGuard require="admin">
          <AsyncButton
            variant="secondary"
            onClick={() => handleDelete(documentName)}
          >
            Remove
          </AsyncButton>
        </AuthGuard>
      );
    }
    if (!defaultDocument) return null;
    if (!defaultDocument.url) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button variant="secondary" disabled>
                Activate
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            No source is configured for this {documentLabel} yet.
          </TooltipContent>
        </Tooltip>
      );
    }
    return (
      <AuthGuard require="admin">
        <AsyncButton
          variant="secondary"
          data-testid={`activate-${defaultDocument.name}`}
          onClick={() => handleActivate(defaultDocument)}
        >
          Activate
        </AsyncButton>
      </AuthGuard>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{description}</p>
        {headerAction}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from(Array(3).keys()).map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {defaults.map((d) => (
            <ListItem
              key={d.name}
              Title={d.name}
              Description={entryByName.has(d.name) ? "Active" : "Not activated"}
              Button={renderAction(entryByName.get(d.name), d.name, d)}
            />
          ))}
          {customEntries.map((e) => (
            <ListItem
              key={e.name}
              Title={e.name}
              Description="Uploaded"
              Button={renderAction(e, e.name)}
            />
          ))}
        </div>
      )}

      <AuthGuard require="admin">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Upload your own {documentLabel}
          </p>
          <FileUpload
            dropzone={dropzone}
            files={file ? [file.name] : []}
            id={`upload-${documentLabel.replaceAll(" ", "-")}`}
          />
          <div className="flex justify-end">
            <AsyncButton disabled={!file} onClick={handleUpload}>
              Upload
            </AsyncButton>
          </div>
        </div>
      </AuthGuard>
    </div>
  );
};

export default OscalDocumentsPanel;
