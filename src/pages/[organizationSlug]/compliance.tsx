import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { Policy } from "@/types/api/api";

import React, { FunctionComponent, useState } from "react";

import { EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import ListItem from "../../components/common/ListItem";
import PolicyDialog from "../../components/PolicyDialog";
import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { withContentTree } from "../../decorators/withContentTree";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { useOrganizationMenu } from "../../hooks/useOrganizationMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../services/devGuardApi";

interface Props {
  policies: Policy[];
}

export const PolicyListItem = ({
  policy,
  onPolicyUpdate,
  onPolicyDelete,
}: {
  policy: Policy;
  onPolicyUpdate: (policy: Policy) => Promise<void>;
  onPolicyDelete: (policy: Policy) => Promise<void>;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const handlePolicyUpdate = async (newPolicy: Policy) => {
    await onPolicyUpdate({ ...newPolicy, id: policy.id });
    setIsOpen(false);
  };
  return (
    <React.Fragment key={policy.id}>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <ListItem
          key={policy.id}
          Button={
            policy.organizationId !== null && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon",
                  })}
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPolicyDelete(policy)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          Title={
            <span className="flex flex-row items-center gap-2">
              {policy.title}
              {policy.organizationId === null && (
                <Badge variant={"secondary"}>Community Managed</Badge>
              )}
            </span>
          }
          Description={policy.description}
        />
      </div>
      <PolicyDialog
        isOpen={isOpen}
        title="Edit Policy"
        description="Edit the policy for your organization."
        buttonTitle="Update Policy"
        onOpenChange={setIsOpen}
        onSubmit={
          policy.organizationId !== null ? handlePolicyUpdate : undefined
        }
        policy={policy}
      />
    </React.Fragment>
  );
};

const ComplianceIndex: FunctionComponent<Props> = ({
  policies: propsPolicies,
}) => {
  const router = useRouter();
  const menu = useOrganizationMenu();
  const activeOrg = useActiveOrg();
  const [open, setOpen] = useState(false);
  const [policies, setPolicy] = useState<Array<Policy>>(propsPolicies);

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

  const handlePolicyUpdate = async (policy: Policy) => {
    const { organizationSlug } = router.query as {
      organizationSlug: string;
    };

    let url = "/organizations/" + organizationSlug + "/policies/" + policy.id;

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

    setPolicy((prev) =>
      prev.map((p) => (p.id === newPolicy.id ? newPolicy : p)),
    );
    toast.success("Policy updated successfully");
  };

  const handlePolicyDelete = async (policy: Policy) => {
    const { organizationSlug } = router.query as {
      organizationSlug: string;
    };

    let url = "/organizations/" + organizationSlug + "/policies/" + policy.id;

    const resp = await browserApiClient(url, {
      method: "DELETE",
    });

    if (!resp.ok) {
      toast.error("Failed to delete policy");
      return;
    }

    // update the policies
    setPolicy((prev) => prev.filter((p) => p.id !== policy.id));
    toast.success("Policy deleted successfully");
  };

  return (
    <Page
      Menu={menu}
      Title={
        <Link
          href={`/${activeOrg.slug}`}
          className="flex flex-row items-center gap-1 !text-white hover:no-underline"
        >
          {activeOrg.name}{" "}
          <Badge
            className="font-body font-normal !text-white"
            variant="outline"
          >
            Organization
          </Badge>
        </Link>
      }
      title="Compliance Controls"
    >
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
            {policies.map((policy) => (
              <PolicyListItem
                onPolicyDelete={handlePolicyDelete}
                onPolicyUpdate={handlePolicyUpdate}
                key={policy.id}
                policy={policy}
              />
            ))}
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

export const getServerSideProps = middleware(
  async (context) => {
    const apiClient = getApiClientFromContext(context);
    // fetch the compliance stats
    const { organizationSlug } = context.query as {
      organizationSlug: string;
    };

    let url = "/organizations/" + organizationSlug + "/policies/";

    return {
      props: {
        policies: await apiClient(url).then((r) => r.json()),
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    contentTree: withContentTree,
    organization: withOrganization,
  },
);
