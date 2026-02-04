// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent, useState } from "react";
import { AssetDTO, UserRole } from "@/types/api/api";
import { Modify } from "@/types/common";
import { UseFormReturn } from "react-hook-form";
import Section from "../common/Section";
import React from "react";
import ConnectToRepoSection from "../ConnectToRepoSection";
import { AssetFormRequirements } from "./asset-form/AssetFormRequirements";
import { AssetFormGeneral } from "./asset-form/AssetFormGeneral";
import { AssetFormVulnsManagement } from "./asset-form/AssetFormVulnsManagement";
import MembersTable from "../MembersTable";
import AssetMemberDialog from "../AssetMemberDialog";
import { Button } from "../ui/button";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  assetId?: string;
  disable?: boolean;
  onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
}

export const createUpdateHandler = <T extends keyof AssetFormValues>(
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>,
  fields: T[],
  onUpdate: (values: Partial<AssetFormValues>) => Promise<void>,
) => {
  return async () => {
    const values: Partial<AssetFormValues> = {};
    // Access dirtyFields at execution time, not closure time
    const dirtyFields = form.formState.dirtyFields;

    fields.forEach((field) => {
      if (dirtyFields?.[field]) {
        values[field] = form.getValues(field);
      }
      if (
        field === "cvssAutomaticTicketThreshold" ||
        field === "riskAutomaticTicketThreshold"
      ) {
        values["enableTicketRange"] = form.getValues("enableTicketRange");
        values["cvssAutomaticTicketThreshold"] = form.getValues(
          "cvssAutomaticTicketThreshold",
        );
        values["riskAutomaticTicketThreshold"] = form.getValues(
          "riskAutomaticTicketThreshold",
        );
      }
    });

    try {
      await onUpdate(values);

      fields.forEach((field) => {
        if (dirtyFields?.[field]) {
          form.resetField(field, { defaultValue: values[field] } as any);
        }
      });
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };
};

export type AssetFormValues = Modify<
  AssetDTO,
  {
    cvssAutomaticTicketThreshold: number[];
    riskAutomaticTicketThreshold: number[];
    enableTicketRange: boolean;
  }
>;

export const AssetSettingsForm: FunctionComponent<
  Props & {
    forceVerticalSections?: boolean;
    disable?: boolean;
    showSecurityRequirements?: boolean;
    showVulnsManagement?: boolean;
    assetId?: string;
    onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
    repositories?: Array<{ value: string; label: string }> | null;
    parentRepositoryId?: string;
    parentRepositoryName?: string;
    repositoryName?: string;
    repositoryId?: string;
    members?: Array<{
      id: string;
      name: string;
      avatarUrl?: string;
      role?: string;
    }>;
    onRemoveMember?: (id: string) => void;
    onChangeMemberRole?: (
      id: string,
      role: UserRole.Admin | UserRole.Member,
    ) => void;
  }
> = ({
  form,
  forceVerticalSections,
  disable,
  showSecurityRequirements = true,
  showVulnsManagement = true,
  assetId,
  onUpdate,
  repositories,
  parentRepositoryId,
  parentRepositoryName,
  repositoryName,
  repositoryId,
  members,
  onRemoveMember,
  onChangeMemberRole,
}) => {
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  return (
    <>
      <Section
        forceVertical={forceVerticalSections}
        title="General"
        description="General settings"
      >
        <AssetFormGeneral disable={disable} form={form} onUpdate={onUpdate} />
      </Section>
      {!disable && members && onRemoveMember && onChangeMemberRole && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            title="Members"
            description="Manage the members of this repository"
          >
            <MembersTable
              onChangeMemberRole={onChangeMemberRole}
              onRemoveMember={onRemoveMember}
              members={members}
            />
            <AssetMemberDialog
              isOpen={memberDialogOpen}
              onOpenChange={setMemberDialogOpen}
            />
            <div className="flex flex-row justify-end">
              <Button onClick={() => setMemberDialogOpen(true)}>
                Add Member
              </Button>
            </div>
          </Section>
        </>
      )}
      {!disable && onUpdate && (
        <>
          <hr />
          <ConnectToRepoSection
            parentRepositoryId={parentRepositoryId}
            parentRepositoryName={parentRepositoryName}
            repositoryName={repositoryName}
            repositoryId={repositoryId}
            repositories={repositories ?? null}
            onUpdate={onUpdate}
          />
        </>
      )}
      {showSecurityRequirements && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            title="Security Requirements"
            description="Security requirements are criteria that your repository must meet to ensure the protection of data, maintain integrity, confidentiality, and availability. They are used in risk calculations to help you prioritize."
          >
            <AssetFormRequirements
              assetId={assetId}
              form={form}
              onUpdate={onUpdate}
            />
          </Section>
        </>
      )}
      {showVulnsManagement && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            title="Vulnerability Management"
            description="Settings related to vulnerability reporting and management."
          >
            <AssetFormVulnsManagement
              assetId={assetId}
              form={form}
              onUpdate={onUpdate}
            />
          </Section>
        </>
      )}
    </>
  );
};

export default AssetSettingsForm;
