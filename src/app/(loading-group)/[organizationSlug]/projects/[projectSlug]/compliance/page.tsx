// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import Page from "@/components/Page";
import type { Policy } from "@/types/dto";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { toast } from "@/lib/toast";
import EmptyParty from "../../../../../../components/common/EmptyParty";
import ListRenderer from "../../../../../../components/common/ListRenderer";
import { PolicyListItem } from "../../../../../../components/common/ProjectPolicyListItem";
import ProjectTitle from "../../../../../../components/common/ProjectTitle";
import { buttonVariants } from "../../../../../../components/ui/button";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../../hooks/useProjectMenu";
import { useProjectPolicies } from "@/hooks/useProjectPolicies";
import { DocDrawer } from "@/components/common/DocDrawer";

const ComplianceIndex = () => {
  const menu = useProjectMenu();
  const activeOrg = useActiveOrg();

  // fetch the compliance stats
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const { policies, isLoading, error, enablePolicy, disablePolicy } =
    useProjectPolicies({ organization: organizationSlug, projectSlug });

  const handleEnablePolicy = async (policy: Policy) => {
    try {
      await enablePolicy(policy);
    } catch {
      toast.error("Failed to enable policy");
    }
  };

  const handleDisablePolicy = async (policy: Policy) => {
    try {
      await disablePolicy(policy);
    } catch {
      toast.error("Failed to disable policy");
    }
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
              <AuthGuard require="admin">
                <Link
                  className={buttonVariants({
                    variant: "outline",
                  })}
                  href={`/${activeOrg.slug}/compliance/`}
                >
                  Modify Policies
                </Link>
              </AuthGuard>
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
