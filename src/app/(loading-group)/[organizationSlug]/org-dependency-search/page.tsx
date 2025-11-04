"use client";

import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Policy } from "@/types/api/api";
import { FunctionComponent, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import EmptyParty from "../../../../components/common/EmptyParty";
import ListRenderer from "../../../../components/common/ListRenderer";
import PolicyListItem from "../../../../components/common/PolicyListItem";
import PolicyDialog from "../../../../components/PolicyDialog";
import { Button } from "../../../../components/ui/button";
import { fetcher } from "../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../hooks/useDecodedParams";
import { useOrganizationMenu } from "../../../../hooks/useOrganizationMenu";
import { browserApiClient } from "../../../../services/devGuardApi";

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
  } = useSWR<Array<Policy>>(
    "/organizations/" + organizationSlug + "/policies/",
    fetcher,
  );

  const handleCreatePolicy = async (policy: Policy) => {
    mutate(
      async (prev) => {
        let url = "/organizations/" + organizationSlug + "/policies/";

        const resp = await browserApiClient(url, {
          method: "POST",
          body: JSON.stringify(policy),
        });

        if (!resp.ok) {
          toast.error("Failed to create policy");
          return;
        }
        // update the policies
        const newPolicy = await resp.json();
        return [newPolicy, ...(prev || [])];
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
        let url =
          "/organizations/" + organizationSlug + "/policies/" + policy.id;

        const resp = await browserApiClient(url, {
          method: "PUT",
          body: JSON.stringify(policy),
        });

        if (!resp.ok) {
          toast.error("Failed to update policy");
          return;
        }

        // update the policies
        const newPolicy = await resp.json();
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
        let url =
          "/organizations/" + organizationSlug + "/policies/" + policy.id;

        const resp = await browserApiClient(url, {
          method: "DELETE",
        });

        if (!resp.ok) {
          toast.error("Failed to delete policy");
          return;
        }

        // update the policies
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
