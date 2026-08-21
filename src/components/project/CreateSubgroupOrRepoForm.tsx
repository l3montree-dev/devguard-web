// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FunctionComponent } from "react";
import { useState } from "react";
import type { AssetFormValues } from "../asset/AssetForm";
import { CreateRepositoryForm } from "../asset/CreateRepositoryForm";
import type { CreateProjectReq } from "../../types/api/req";
import { CreateGroupForm } from "./CreateGroupForm";

interface Props {
  onCreateRepository: (req: AssetFormValues) => Promise<void>;
  onCreateSubgroup: (req: CreateProjectReq) => Promise<void>;
}

export const CreateSubgroupOrRepoForm: FunctionComponent<Props> = ({
  onCreateRepository,
  onCreateSubgroup,
}) => {
  const [tab, setTab] = useState<"repository" | "subgroup">("repository");

  return (
    <Tabs
      className="w-full max-w-6xl"
      value={tab}
      onValueChange={(value) => setTab(value as "repository" | "subgroup")}
    >
      <TabsList>
        <TabsTrigger value="repository" data-testid="create-repository-tab">
          Create new Repository
        </TabsTrigger>
        <TabsTrigger
          value="subgroup"
          data-testid="create-subgroup-tab"
          data-tour="create-subgroup-button"
        >
          Create new Subgroup
        </TabsTrigger>
      </TabsList>
      <TabsContent value="repository">
        <CreateRepositoryForm variant="inline" onSubmit={onCreateRepository} />
      </TabsContent>
      <TabsContent value="subgroup">
        <CreateGroupForm
          variant="inline"
          onSubmit={onCreateSubgroup}
          title="Create new Subgroup"
          description="Subgroups can help to organize your bigger software projects. You can separate your backend, frontend and website repositories for example."
        />
      </TabsContent>
    </Tabs>
  );
};
