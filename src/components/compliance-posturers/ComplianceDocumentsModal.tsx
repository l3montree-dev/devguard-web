// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ComplianceScope } from "@/services/compliancePostureService";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import CatalogPanel from "./CatalogPanel";
import ComponentDefinitionPanel from "./ComponentDefinitionPanel";

export type ComplianceDocumentsTab = "catalogs" | "components";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  tab: ComplianceDocumentsTab;
  setTab: (tab: ComplianceDocumentsTab) => void;
  scope: ComplianceScope;
  // the page listing all components which apply to the scope
  componentsHref: string;
  onChange: () => void;
}

const ComplianceDocumentsModal: FunctionComponent<Props> = ({
  open,
  setOpen,
  tab,
  setTab,
  scope,
  componentsHref,
  onChange,
}) => (
  <Dialog open={open}>
    <DialogContent
      setOpen={setOpen}
      className="flex h-[80vh] max-w-2xl flex-col"
    >
      <DialogHeader>
        <DialogTitle>Manage frameworks</DialogTitle>
      </DialogHeader>
      {/* both tabs get the same height, so the dialog does not jump when switching */}
      <Tabs
        className="flex min-h-0 flex-1 flex-col"
        value={tab}
        onValueChange={(value) => setTab(value as ComplianceDocumentsTab)}
      >
        <TabsList className="w-fit">
          <TabsTrigger value="catalogs" data-testid="manage-catalogs-tab">
            Catalogs
          </TabsTrigger>
          <TabsTrigger value="components" data-testid="manage-components-tab">
            Components
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="catalogs"
          className="mt-4 min-h-0 flex-1 overflow-y-auto"
        >
          <CatalogPanel scope={scope} onChange={onChange} />
        </TabsContent>
        <TabsContent
          value="components"
          className="mt-4 min-h-0 flex-1 overflow-y-auto"
        >
          <ComponentDefinitionPanel
            scope={scope}
            componentsHref={componentsHref}
            onChange={onChange}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);

export default ComplianceDocumentsModal;
