import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { PolicyEvaluation } from "@/types/api/api";

import { FunctionComponent } from "react";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ColoredBadge from "../../../../../../../../../components/common/ColoredBadge";
import ListItem from "../../../../../../../../../components/common/ListItem";
import { withAssetVersion } from "../../../../../../../../../decorators/withAssetVersion";
import { getApiClientFromContext } from "../../../../../../../../../services/devGuardApi";
interface Props {
  compliance: PolicyEvaluation[];
}

export const violationLengthToLevel = (length: number) => {
  if (length === 0) return "low";
  if (length <= 2) return "medium";
  if (length <= 4) return "high";
  return "critical";
};

const ComplianceIndex: FunctionComponent<Props> = ({ compliance }) => {
  const router = useRouter();
  const menu = useAssetMenu();
  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Compliance Controls">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="This section contains all compliance controls that are available for your asset."
            title="Compliance Controls"
            forceVertical
          >
            {compliance.map((control) => (
              <Link
                key={control.filename}
                href={
                  router.asPath + "/" + control.filename.replace(".rego", "")
                }
              >
                <ListItem
                  reactOnHover
                  key={control.filename}
                  Title={
                    <span className="flex flex-row items-center gap-2">
                      {control.title}
                      {control.compliant === null ? (
                        <ColoredBadge variant="high">
                          <TriangleAlert className="h-4 w-4 mr-1" />
                          Could not evaluate control
                        </ColoredBadge>
                      ) : (
                        <ColoredBadge
                          variant={violationLengthToLevel(
                            control.violations?.length ?? 0,
                          )}
                        >
                          {control.violations?.length ?? 0} Violations
                        </ColoredBadge>
                      )}
                    </span>
                  }
                  Description={<div>{control.description}</div>}
                  Button={<div className="whitespace-nowrap"></div>}
                />
              </Link>
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
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.query as {
        organizationSlug: string;
        projectSlug: string;
        assetSlug: string;
        assetVersionSlug: string;
      };

    let url =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug;

    return {
      props: {
        compliance: await apiClient(url + "/compliance").then((r) => r.json()),
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    contentTree: withContentTree,
    assetVersion: withAssetVersion,
  },
);
