// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useCatalogs } from "@/hooks/useOscalDocuments";
import type { ComplianceScope } from "@/services/compliancePostureService";
import {
  DEFAULT_CATALOGS,
  deleteCatalog,
  fetchOscalDocument,
  saveCatalog,
} from "@/services/oscalDocumentService";
import type { FunctionComponent } from "react";
import OscalDocumentsPanel from "./OscalDocumentsPanel";

interface Props {
  scope: ComplianceScope;
  onChange: () => void;
}

const CatalogPanel: FunctionComponent<Props> = ({ scope, onChange }) => {
  const { data: catalogs, isLoading, mutate } = useCatalogs(scope);
  const revalidate = async () => {
    await mutate();
    onChange();
  };

  return (
    <OscalDocumentsPanel
      description="The controls of the activated OSCAL catalogs become compliance postures here and on every level below. Catalogs can only be removed on the level they were activated on."
      documentLabel="catalog"
      defaults={DEFAULT_CATALOGS}
      entries={catalogs}
      isLoading={isLoading}
      onActivateDefault={async (document) => {
        await saveCatalog(
          scope,
          document.name,
          await fetchOscalDocument(document.url),
        );
        await revalidate();
      }}
      onUpload={async (catalog) => {
        await saveCatalog(scope, undefined, catalog);
        await revalidate();
      }}
      onDelete={async (name) => {
        await deleteCatalog(scope, name);
        await revalidate();
      }}
    />
  );
};

export default CatalogPanel;
