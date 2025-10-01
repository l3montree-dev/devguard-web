"use client";

import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Policy, UserRole } from "@/types/api/api";

import React, { FunctionComponent, useState } from "react";

import { useCurrentUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";
import EmptyParty from "../../../../../components/common/EmptyParty";
import ListItem from "../../../../../components/common/ListItem";
import ListRenderer from "../../../../../components/common/ListRenderer";
import ProjectTitle from "../../../../../components/common/ProjectTitle";
import PolicyDialog from "../../../../../components/PolicyDialog";
import { Badge } from "../../../../../components/ui/badge";
import { buttonVariants } from "../../../../../components/ui/button";
import { Switch } from "../../../../../components/ui/switch";
import { useActiveOrg } from "../../../../../hooks/useActiveOrg";
import useDecodedParams from "../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../hooks/useProjectMenu";
import { browserApiClient } from "../../../../../services/devGuardApi";

interface Props {
  policies: Array<Policy & { enabled: boolean }>;
}

export const violationLengthToLevel = (length: number) => {
  if (length === 0) return "low";
  if (length <= 2) return "medium";
  if (length <= 4) return "high";
  return "critical";
};

export const PolicyListItem = ({
  policy,
  onEnablePolicy,
  onDisablePolicy,
}: {
  policy: Policy & { enabled: boolean };
  onEnablePolicy: (policy: Policy) => Promise<void>;
  onDisablePolicy: (policy: Policy) => Promise<void>;
}) => {
  const currentUserRole = useCurrentUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const handlePolicyToggle = async (enabled: boolean) => {
    if (enabled) {
      await onEnablePolicy(policy);
    } else {
      await onDisablePolicy(policy);
    }
  };

  return (
    <React.Fragment key={policy.id}>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <ListItem
          reactOnHover
          key={policy.id}
          Button={
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={policy.enabled}
                onCheckedChange={handlePolicyToggle}
                disabled={
                  currentUserRole !== UserRole.Admin &&
                  currentUserRole !== UserRole.Owner
                }
              />
            </div>
          }
          Title={
            <span className="flex flex-row items-center gap-2">
              {policy.title}
              {policy.organizationId === null && (
                <Badge variant="secondary">Community Managed</Badge>
              )}
            </span>
          }
          Description={policy.description}
        />
      </div>
      <PolicyDialog
        isOpen={isOpen}
        title={policy.title}
        description={policy.description}
        buttonTitle="Update Policy"
        onOpenChange={setIsOpen}
        policy={policy}
      />
    </React.Fragment>
  );
};

const ComplianceIndex: FunctionComponent<Props> = () => {
  const params = useDecodedParams();
  const menu = useProjectMenu();
  const activeOrg = useActiveOrg();

  // fetch the compliance stats
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const {
    data: policies,
    mutate,
    error,
    isLoading,
  } = useSWR<Array<Policy & { enabled: boolean }>>(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/policies/",
    async (url: string) => {
      const [allPolicies, enabledPolicies] = await Promise.all([
        browserApiClient(url).then((r) => r.json()),
        browserApiClient(
          "/organizations/" + organizationSlug + "/policies/",
        ).then((r) => r.json()),
      ]);
      return allPolicies.map((policy: Policy) => ({
        ...policy,
        enabled: enabledPolicies.some((p: Policy) => p.id === policy.id),
      }));
    },
  );

  const currentUserRole = useCurrentUserRole();

  const handleEnablePolicy = async (policy: Policy) => {
    mutate(
      async (prev) => {
        const { organizationSlug, projectSlug } = params as {
          organizationSlug: string;
          projectSlug: string;
        };

        let url =
          "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/policies/" +
          policy.id;

        const resp = await browserApiClient(url, {
          method: "PUT",
        });

        if (!resp.ok) {
          toast.error("Failed to enable policy");
        }
        return (
          prev?.map((p) =>
            p.id === policy.id ? { ...p, enabled: true } : p,
          ) || []
        );
      },
      {
        optimisticData(currentData) {
          return (
            currentData?.map((p) =>
              p.id === policy.id ? { ...p, enabled: true } : p,
            ) || []
          );
        },
        rollbackOnError: true,
      },
    );
  };

  const handleDisablePolicy = async (policy: Policy) => {
    const { organizationSlug, projectSlug } = params as {
      organizationSlug: string;
      projectSlug: string;
    };

    mutate(
      async (prev) => {
        let url =
          "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/policies/" +
          policy.id;

        const resp = await browserApiClient(url, {
          method: "DELETE",
        });

        if (!resp.ok) {
          toast.error("Failed to disable policy");
          return;
        }
        return prev?.map((p) =>
          p.id === policy.id ? { ...p, enabled: false } : p,
        );
      },
      {
        optimisticData: (currentData) =>
          currentData?.map((p) =>
            p.id === policy.id ? { ...p, enabled: false } : p,
          ) || [],
      },
    );
  };

  return (
    <Page Menu={menu} Title={<ProjectTitle />} title="Compliance Controls">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="Enable or disable policies created by your organization for this project."
            title="Organization Compliance Controls"
            forceVertical
            Button={
              currentUserRole === UserRole.Admin ||
              currentUserRole === UserRole.Owner ? (
                <Link
                  className={buttonVariants({
                    variant: "outline",
                  })}
                  href={`/${activeOrg.slug}/compliance/`}
                >
                  Modify Policies
                </Link>
              ) : (
                <> </>
              )
            }
          >
            <ListRenderer
              isLoading={isLoading}
              error={error}
              Empty={
                <EmptyParty
                  title="No policies found"
                  description="There are no policies available to enable or disable."
                />
              }
              data={policies}
              renderItem={(policy) => (
                <PolicyListItem
                  onDisablePolicy={handleDisablePolicy}
                  onEnablePolicy={handleEnablePolicy}
                  key={policy.id}
                  policy={policy}
                />
              )}
            />
          </Section>
        </div>
      </div>
    </Page>
  );
};

export default ComplianceIndex;
