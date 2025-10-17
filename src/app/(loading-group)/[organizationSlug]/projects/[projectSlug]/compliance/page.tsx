"use client";

import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Policy, UserRole } from "@/types/api/api";

import { useCurrentUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";
import EmptyParty from "../../../../../../components/common/EmptyParty";
import ListRenderer from "../../../../../../components/common/ListRenderer";
import { PolicyListItem } from "../../../../../../components/common/ProjectPolicyListItem";
import ProjectTitle from "../../../../../../components/common/ProjectTitle";
import { buttonVariants } from "../../../../../../components/ui/button";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../../hooks/useProjectMenu";
import { browserApiClient } from "../../../../../../services/devGuardApi";

const ComplianceIndex = () => {
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
