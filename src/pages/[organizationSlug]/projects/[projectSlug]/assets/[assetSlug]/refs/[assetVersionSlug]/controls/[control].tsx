import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { PolicyEvaluation } from "@/types/api/api";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useState } from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";

import AssetTitle from "@/components/common/AssetTitle";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { useLoader } from "@/hooks/useLoader";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import CopyCode from "../../../../../../../../../components/common/CopyCode";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../../../../../components/ui/collapsible";
import { useActiveAssetVersion } from "../../../../../../../../../hooks/useActiveAssetVersion";
import { XIcon } from "lucide-react";
import { classNames } from "../../../../../../../../../utils/common";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface Props {
  policyDetails: PolicyEvaluation;
}

export const getClassNames = (priority: number) => {
  if (priority <= 2) return "text-red-600 bg-red-600/20 dark:text-red-400";

  if (priority <= 4)
    return "text-orange-700 dark:text-orange-300 bg-orange-500/20";
  if (priority <= 6)
    return "text-yellow-700 dark:text-yellow-300 bg-yellow-500/20";
  if (priority <= 8)
    return "dark:text-green-300 text-green-600 bg-green-500/20";
  return "text-gray-700 bg-gray-500/20 dark:text-gray-200";
};

export const severityToColor = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "#ef4444";
    case "HIGH":
      return "#f97316";
    case "MEDIUM":
      return "#facc15";
    case "LOW":
      return "#22c55e";
    default:
      return "gray";
  }
};

const PriorityBadge = ({ priority }: { priority: number }) => {
  const cl = getClassNames(priority);
  return (
    <span
      className={classNames(
        cl,
        "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
      )}
    >
      Priority {priority}
    </span>
  );
};

const Index: FunctionComponent<Props> = (props) => {
  const assetMenu = useAssetMenu();

  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={props.policyDetails.title}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">
                {props.policyDetails.title}
              </h1>
              <div className="mt-4 text-muted-foreground">
                <Markdown>
                  {props.policyDetails.description.replaceAll("\n", "\n\n")}
                </Markdown>
              </div>

              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                <div className="flex flex-row gap-2">
                  <PriorityBadge priority={props.policyDetails.priority} />
                  {props.policyDetails.tags.map((s) => (
                    <Badge key={s} variant={"secondary"}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Collapsible className="bg-secondary border rounded-lg mt-4">
                  <CollapsibleTrigger className="w-full flex justify-between items-center text-left font-semibold rounded-lg px-2 py-1 ">
                    <span>Expand policy as code</span>
                    <ChevronDownIcon className="h-4 w-4 ml-2 inline-block" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CopyCode
                      language="rego"
                      codeString={props.policyDetails.content}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div>
                <h2 className="mt-8 text-lg font-semibold">
                  Policy evaluation result
                </h2>
                <div className="flex flex-col gap-2 mt-4">
                  {props.policyDetails.violations.map((violation) => (
                    <div
                      key={violation}
                      className="flex flex-row items-center gap-2 rounded-lg border p-2"
                    >
                      <XIcon className="h-4 w-4 text-red-500" />
                      {violation}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-16"></div>
            </div>
            <div className="col-span-1 border-l"></div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const {
      organizationSlug,
      projectSlug,
      assetSlug,
      assetVersionSlug,
      control,
    } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/compliance/" +
      control;

    const [resp]: [PolicyEvaluation] = await Promise.all([
      apiClient(uri).then((r) => r.json()),
    ]);

    return {
      props: {
        policyDetails: resp,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    asset: withAsset,
    project: withProject,
    contentTree: withContentTree,
    assetVersion: withAssetVersion,
  },
);

export default Index;
