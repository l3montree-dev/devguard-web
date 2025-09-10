import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { Policy, UserRole } from "@/types/api/api";

import React, { FunctionComponent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/compat/router";
import { toast } from "sonner";
import ListItem from "../../../../components/common/ListItem";
import PolicyDialog from "../../../../components/PolicyDialog";
import { Badge } from "../../../../components/ui/badge";
import { buttonVariants } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { withContentTree } from "../../../../decorators/withContentTree";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useProjectMenu } from "../../../../hooks/useProjectMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import { withProject } from "../../../../decorators/withProject";
import { useCurrentUserRole } from "@/hooks/useUserRole";

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
  const router = useRouter();
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

const ComplianceIndex: FunctionComponent<Props> = ({
  policies: propsPolicies,
}) => {
  const router = useRouter();
  const menu = useProjectMenu();
  const activeOrg = useActiveOrg();
  const [open, setOpen] = useState(false);
  const [policies, setPolicy] =
    useState<Array<Policy & { enabled: boolean }>>(propsPolicies);

  const currentUserRole = useCurrentUserRole();

  const handleCreatePolicy = async (policy: Policy) => {
    const { organizationSlug } = router.query as {
      organizationSlug: string;
    };

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
    setPolicy((prev) => [...prev, newPolicy]);
    toast.success("Policy created successfully");
    setOpen(false);
  };

  const handleEnablePolicy = async (policy: Policy) => {
    const { organizationSlug, projectSlug } = router.query as {
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
      return;
    }

    // update the policies
    setPolicy((prev) =>
      prev.map((p) => (p.id === policy.id ? { ...p, enabled: true } : p)),
    );
  };

  const handleDisablePolicy = async (policy: Policy) => {
    const { organizationSlug, projectSlug } = router.query as {
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
      method: "DELETE",
    });

    if (!resp.ok) {
      toast.error("Failed to disable policy");
      return;
    }

    // update the policies
    setPolicy((prev) =>
      prev.map((p) => (p.id === policy.id ? { ...p, enabled: false } : p)),
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
            {policies.map((policy) => (
              <PolicyListItem
                onDisablePolicy={handleDisablePolicy}
                onEnablePolicy={handleEnablePolicy}
                key={policy.id}
                policy={policy}
              />
            ))}
          </Section>
        </div>
      </div>
    </Page>
  );
};

export default ComplianceIndex;

export const getServerSideProps = middleware(
  async (context) => {
    const apiClient = getApiClientFromContext(context);
    // fetch the compliance stats
    const { organizationSlug, projectSlug } = context.query as {
      organizationSlug: string;
      projectSlug: string;
    };

    const [allPolicies, enabledPolicies] = await Promise.all([
      apiClient("/organizations/" + organizationSlug + "/policies/").then((r) =>
        r.json(),
      ),
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/policies/",
      ).then((r) => r.json()),
    ]);
    return {
      props: {
        policies: allPolicies.map((policy: Policy) => ({
          ...policy,
          enabled: enabledPolicies.some((p: Policy) => p.id === policy.id),
        })),
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    project: withProject,
    contentTree: withContentTree,
    organization: withOrganization,
  },
);
