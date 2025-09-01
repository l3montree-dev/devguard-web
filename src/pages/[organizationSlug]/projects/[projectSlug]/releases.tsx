import { useRouter } from "next/router";
import React from "react";
import { toast } from "sonner";
import Alert from "../../../../components/common/Alert";
import EmptyParty from "../../../../components/common/EmptyParty";
import ListItem from "../../../../components/common/ListItem";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import Page from "../../../../components/Page";
import ReleaseDialog from "../../../../components/ReleaseDialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { middleware } from "../../../../decorators/middleware";
import { withContentTree } from "../../../../decorators/withContentTree";
import { withOrganization } from "../../../../decorators/withOrganization";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withProject } from "../../../../decorators/withProject";
import { withSession } from "../../../../decorators/withSession";
import { useProjectMenu } from "../../../../hooks/useProjectMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import {
  CandidatesDTO,
  Paged,
  ReleaseDTO,
  ReleaseItem,
} from "../../../../types/api/api";
import { Modify } from "../../../../types/common";
import { buildFilterSearchParams } from "../../../../utils/url";

interface Props {
  releases: Paged<ReleaseDTO>;
  candidates: CandidatesDTO;
}

const Releases = (props: Props) => {
  const menu = useProjectMenu();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { organizationSlug, projectSlug } = router.query;

  const handleReleaseCreation = async (
    release: Modify<
      Omit<ReleaseDTO, "id" | "createdAt" | "updatedAt">,
      {
        items: Omit<ReleaseItem, "id" | "releaseId" | "projectId">[];
      }
    >,
  ) => {
    const resp = await browserApiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/releases/",
      { method: "POST", body: JSON.stringify(release) },
    );

    if (resp.ok) {
      router.reload();
    } else {
      toast.error("Failed to create release");
    }
  };

  const deleteRelease = async (release: ReleaseDTO) => {
    const resp = await browserApiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/releases/" +
        release.id,
      { method: "DELETE" },
    );

    if (resp.ok) {
      router.reload();
      toast.success("Release deleted");
    } else {
      toast.error("Failed to delete release");
    }
  };

  return (
    <Page Menu={menu} Title={<ProjectTitle />} title="Releases">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="Manage your project releases. Create new releases to monitor and track changes over time."
            title="Releases"
            forceVertical
            Button={
              <Button onClick={() => setOpen(true)}>Create new Release</Button>
            }
          >
            {props.releases.data.length === 0 && (
              <EmptyParty
                title="Unified Releases for Versioned Software Visibility"
                description="Releases let you group related artifacts into logical sets and track them through dashboards. This gives you a consolidated view of your software across versions, such as 1.0.0 and 2.0.0."
              />
            )}
            {props.releases.data.map((release) => (
              <ListItem
                key={release.id}
                Title={release.name}
                Button={
                  <Alert
                    onConfirm={() => deleteRelease(release)}
                    title="Delete Release"
                    description="Are you sure you want to delete this release? This action cannot be undone."
                  >
                    <Button variant="destructive">Delete</Button>
                  </Alert>
                }
                Description={
                  <div>
                    <div className="flex flex-row flex-wrap mt-2 gap-2">
                      {release.items?.map((item) => (
                        <Tooltip key={item.id}>
                          <TooltipTrigger>
                            <Badge
                              key={item.id}
                              className="whitespace-nowrap max-w-52 overflow-hidden text-ellipsis block"
                              variant="secondary"
                            >
                              {item.childReleaseId
                                ? item.childReleaseName
                                : item.artifactName +
                                  "@" +
                                  item.artifactAssetVersionName}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.childReleaseId
                              ? "Release: " + item.childReleaseName
                              : "Artifact: " +
                                item.artifactName +
                                "@" +
                                item.artifactAssetVersionName}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                }
              />
            ))}
          </Section>
        </div>
      </div>
      <ReleaseDialog
        onCreate={handleReleaseCreation}
        candidates={props.candidates}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </Page>
  );
};

export default Releases;

export const getServerSideProps = middleware(
  async (context) => {
    // fetch the project
    let { organizationSlug, projectSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/releases/";

    const query = buildFilterSearchParams(context);

    // check for page and page size query params
    // if they are there, append them to the uri
    const [releasesResp, candidatesResp] = await Promise.all([
      apiClient(uri + "?" + query.toString()),
      apiClient(uri + "candidates/"),
    ]);

    // fetch a personal access token from the user
    const releases: ReleaseDTO[] = await releasesResp.json();
    const candidates: CandidatesDTO = await candidatesResp.json();

    return {
      props: {
        releases,
        candidates,
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
