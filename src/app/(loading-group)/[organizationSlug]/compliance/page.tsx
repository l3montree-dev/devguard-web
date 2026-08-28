// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useOrgPolicies } from "@/hooks/useCompliancePostures";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import type { Policy } from "@/types/dto";
import { useState } from "react";
import type { FunctionComponent } from "react";
import { toast } from "@/lib/toast";
import EmptyParty from "../../../../components/common/EmptyParty";
import ListRenderer from "../../../../components/common/ListRenderer";
import PolicyListItem from "../../../../components/common/PolicyListItem";
import PolicyDialog from "../../../../components/PolicyDialog";
import { Button } from "../../../../components/ui/button";
import useDecodedParams from "../../../../hooks/useDecodedParams";
import { useOrganizationMenu } from "../../../../hooks/useOrganizationMenu";
import {
  createPolicy,
  deletePolicy,
  updatePolicy,
} from "@/services/policyService";
import { DocDrawer } from "@/components/common/DocDrawer";

const ComplianceIndex: FunctionComponent = () => {
  const menu = useOrganizationMenu();
  const [open, setOpen] = useState(false);
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };
  const {
    data: policies,
    isLoading,
    error,
    mutate,
  } = useOrgPolicies(organizationSlug);

  const handleCreatePolicy = async (policy: Policy) => {
    mutate(
      async (prev) => {
        let newPolicy;
        try {
          newPolicy = await createPolicy(organizationSlug, policy as never);
        } catch {
          toast.error("Failed to create policy");
          return;
        }
        // POST returns the bound request DTO, which carries no id - the
        // list is corrected by the revalidation that follows.
        return [newPolicy as unknown as Policy, ...(prev || [])];
      },
      {
        optimisticData: (prev) => [
          { ...policy, id: Math.random().toString() },
          ...(prev || []),
        ],
      },
    );

    toast.success("Policy created successfully");
    setOpen(false);
  };

  const handlePolicyUpdate = async (policy: Policy) => {
    mutate(
      async (prev) => {
        let newPolicy;
        try {
          newPolicy = (await updatePolicy(
            organizationSlug,
            policy.id,
            policy as never,
          )) as unknown as Policy;
        } catch {
          toast.error("Failed to update policy");
          return;
        }
        toast.success("Policy updated successfully");
        return prev?.map((p) => (p.id === newPolicy.id ? newPolicy : p));
      },
      {
        optimisticData: (prev) =>
          prev?.map((p) => (p.id === policy.id ? policy : p)) || [],
      },
    );
  };

  const handlePolicyDelete = async (policy: Policy) => {
    mutate(
      async (prev) => {
        try {
          await deletePolicy(organizationSlug, policy.id);
        } catch {
          toast.error("Failed to delete policy");
          return;
        }
        toast.success("Policy deleted successfully");
        return prev?.filter((p) => p.id !== policy.id);
      },
      {
        optimisticData: (prev) => prev?.filter((p) => p.id !== policy.id) || [],
      },
    );
  };

  return (
    <Page Menu={menu} Title={null} title="">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="Modify your organization compliance policies here."
            title="Compliance Controls"
            forceVertical
            Button={
              <Button onClick={() => setOpen(true)}>Upload new Policy</Button>
            }
          >
            <div className="flex justify-end">
              <DocDrawer
                triggerLabel="Learn why compliance matters"
                drawerTitle="Why Compliance Matters"
                mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/compliance/why-compliance-matters.mdx"
                docsUrl="https://docs.devguard.org/explanations/compliance/why-compliance-matters/"
              />
            </div>
            <ListRenderer
              isLoading={isLoading}
              error={error}
              data={policies}
              Empty={
                <EmptyParty
                  title="No Policies"
                  description="Create a new policy to get started."
                />
              }
              renderItem={(policy) => (
                <PolicyListItem
                  onPolicyDelete={handlePolicyDelete}
                  onPolicyUpdate={handlePolicyUpdate}
                  key={policy.id}
                  policy={policy}
                />
              )}
            />
          </Section>
        </div>
      </div>
      <PolicyDialog
        isOpen={open}
        title="Create new Policy"
        description="Create a new policy for your organization."
        buttonTitle="Create Policy"
        onOpenChange={setOpen}
        onSubmit={handleCreatePolicy}
      />
    </Page>
  );
};

export default ComplianceIndex;
