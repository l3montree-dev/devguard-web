import SortingCaret from "@/components/common/SortingCaret";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import Image from "next/image";
import {
  AssetVersionDTO,
  FlawByPackage,
  FlawEventDTO,
  FlawWithCVE,
  Paged,
} from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import Page from "@/components/Page";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyList from "@/components/common/EmptyList";
import Section from "@/components/common/Section";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import { Loader2 } from "lucide-react";
import EmptyParty from "@/components/common/EmptyParty";
import { buttonVariants } from "@/components/ui/button";
import useTable from "@/hooks/useTable";
import { buildFilterQuery, buildFilterSearchParams } from "@/utils/url";
import { fetchAssetStats } from "@/services/statService";
import FormatDate from "@/components/risk-assessment/FormatDate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { defaultScanner, findUser } from "@/utils/view";
import {
  eventMessages,
  eventTypeMessages,
} from "@/components/risk-assessment/RiskAssessmentFeed";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Markdown from "react-markdown";
import events from "./events";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Props {
  events: Paged<FlawEventDTO>;
}

const Index: FunctionComponent<Props> = ({ events }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const router = useRouter();
  const assetVersion = useActiveAssetVersion();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();
  const currentUser = useCurrentUser();

  const { branches, tags } = useAssetBranchesAndTags();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div>
        <BranchTagSelector branches={branches} tags={tags} />
        <Card className="col-span-4 row-span-2">
          <CardHeader>
            <CardTitle>Activity Stream</CardTitle>
            <CardDescription>
              Displays the last events that happened on the asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <ul
                className="relative flex flex-col gap-10 pb-10 text-foreground"
                role="list"
              >
                <div className="absolute left-3 h-full border-l border-r bg-secondary" />
                {events.data.map((event, index) => {
                  const user = findUser(event.userId, activeOrg, currentUser);
                  const msg = eventMessages(event, index, events.data);
                  return (
                    <li
                      className={classNames(
                        "relative flex flex-row items-start gap-4 transition-all",
                      )}
                      key={event.id}
                    >
                      <div className="w-full">
                        <div className="flex w-full flex-col">
                          <div className="flex flex-row items-start gap-2">
                            {event.userId === "system" ? (
                              <Avatar>
                                <AvatarFallback className="bg-secondary">
                                  <Image
                                    width={20}
                                    height={20}
                                    src="/logo_icon.svg"
                                    alt="logo"
                                  />
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar>
                                {Boolean(user?.avatarUrl) && (
                                  <AvatarImage
                                    src={user?.avatarUrl}
                                    alt={event.userId}
                                  />
                                )}
                                <AvatarFallback className="bg-secondary">
                                  {user.realName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div className="flex flex-row items-start gap-2">
                                {event.type && (
                                  <Badge variant={"secondary"}>
                                    {event.type}
                                  </Badge>
                                )}
                                {event.arbitraryJsonData.scannerIds
                                  ?.split(" ")
                                  .map((s) => (
                                    <Badge key={s} variant={"secondary"}>
                                      {s.replace(defaultScanner, "")}
                                    </Badge>
                                  ))}
                              </div>

                              <div className="w-full overflow-hidden rounded border">
                                <Link
                                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset!.slug}/refs/${assetVersion!.slug}/flaws/${event.vulnId}`}
                                  className="text-inherit no-underline visited:text-inherit hover:text-inherit active:text-inherit"
                                >
                                  <div className="w-full">
                                    <p className="w-full bg-card px-2 py-2 font-medium">
                                      {
                                        findUser(
                                          event.userId,
                                          activeOrg,
                                          currentUser,
                                        ).displayName
                                      }{" "}
                                      {eventTypeMessages(
                                        event,
                                        index,
                                        event.flawName || "a vulnerability",
                                        events.data,
                                      )}
                                    </p>
                                  </div>

                                  {Boolean(msg) && (
                                    <div className="mdx-editor-content w-full rounded p-2 text-sm text-muted-foreground">
                                      <Markdown className={"text-foreground"}>
                                        {msg}
                                      </Markdown>
                                    </div>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-10 mt-2 text-xs font-normal text-muted-foreground">
                          <FormatDate dateString={event.createdAt} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4">
          <CustomPagination {...events} />
        </div>
      </div>
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
    const events = await apiClient(
      url + "/events/?pageSize=5&" + query.toString(),
    ).then((r) => r.json());

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
