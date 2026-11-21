// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useComponentDefinitions } from "@/hooks/useOscalDocuments";
import type { ComplianceScope } from "@/services/compliancePostureService";
import {
  DEFAULT_COMPONENT_DEFINITIONS,
  deleteComponentDefinition,
  fetchOscalDocument,
  saveComponentDefinition,
} from "@/services/oscalDocumentService";
import type { FunctionComponent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Component } from "lucide-react";
import Link from "next/link";
import OscalDocumentsPanel from "./OscalDocumentsPanel";

interface Props {
  scope: ComplianceScope;
  // called after a document was activated, uploaded or removed, so the owner of
  // the postures can revalidate them
  onChange: () => void;
  // the page listing all components which apply to the scope
  componentsHref: string;
}

const ComponentDefinitionPanel: FunctionComponent<Props> = ({
  scope,
  componentsHref,
  onChange,
}) => {
  const {
    data: definitions,
    isLoading,
    mutate,
  } = useComponentDefinitions(scope);
  const revalidate = async () => {
    await mutate();
    onChange();
  };

  return (
    <OscalDocumentsPanel
      description="OSCAL component definitions describe which controls a component (e.g. branch protection) implements. They apply here and on every level below and can only be removed on the level they were uploaded on."
      documentLabel="component definition"
      defaults={DEFAULT_COMPONENT_DEFINITIONS}
      entries={definitions}
      isLoading={isLoading}
      onActivateDefault={async (document) => {
        await saveComponentDefinition(
          scope,
          document.name,
          await fetchOscalDocument(document.url),
        );
        await revalidate();
      }}
      onUpload={async (componentDefinition) => {
        await saveComponentDefinition(scope, undefined, componentDefinition);
        await revalidate();
      }}
      onDelete={async (name) => {
        await deleteComponentDefinition(scope, name);
        await revalidate();
      }}
      headerAction={
        <Link
          href={componentsHref}
          className={buttonVariants({
            variant: "secondary",
            size: "sm",
            className: "w-fit",
          })}
        >
          <Component className="mr-2 h-4 w-4" />
          See all components
        </Link>
      }
    />
  );
};

export default ComponentDefinitionPanel;
