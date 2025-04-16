import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { Paged, VulnEventDTO } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { buildFilterSearchParams } from "@/utils/url";
import VulnEventItem from "../../../../../../../../components/VulnEventItem";
import Section from "../../../../../../../../components/common/Section";

interface Props {
  events: Paged<VulnEventDTO>;
}

const Index: FunctionComponent<Props> = ({ events }) => {
  const assetMenu = useAssetMenu();

  const { branches, tags } = useAssetBranchesAndTags();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <BranchTagSelector branches={branches} tags={tags} />

      <Section
        description="Displays the last events that happened on the asset."
        primaryHeadline
        forceVertical
        title="Activity-Stream"
      >
        <div>
          <div>
            <ul
              className="relative flex flex-col gap-10 pb-10 text-foreground"
              role="list"
            >
              <div className="absolute left-3 h-full border-l border-r bg-secondary" />
              {events.data.map((event, index, events) => {
                return (
                  <VulnEventItem
                    key={event.id}
                    event={event}
                    index={index}
                    events={events}
                  />
                );
              })}
            </ul>
          </div>

          <div className="mt-4">
            <CustomPagination {...events} />
          </div>
        </div>
      </Section>
    </Page>
  );
};

export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    let url =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug;

    if (assetVersionSlug) {
      // we should fetch the stats of a specific asset version instead of the default one.
      url += "/refs/" + assetVersionSlug;
    }

    const query = buildFilterSearchParams(context);
    const events = await apiClient(url + "/events/?" + query.toString()).then(
      (r) => r.json(),
    );

    return {
      props: {
        events,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    assetVersion: withAssetVersion,
    contentTree: withContentTree,
  },
);
