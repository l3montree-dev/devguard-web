"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import useSWR from "swr";
import Alert from "../../../../../../components/common/Alert";
import EmptyParty from "../../../../../../components/common/EmptyParty";
import ListItem from "../../../../../../components/common/ListItem";
import ListRenderer from "../../../../../../components/common/ListRenderer";
import ProjectTitle from "../../../../../../components/common/ProjectTitle";
import Section from "../../../../../../components/common/Section";
import Page from "../../../../../../components/Page";
import ReleaseDialog from "../../../../../../components/ReleaseDialog";
import { Badge } from "../../../../../../components/ui/badge";
import { Button } from "../../../../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../components/ui/tooltip";
import { fetcher } from "../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../../hooks/useProjectMenu";
import { useSession } from "../../../../../../context/SessionContext";
import { browserApiClient } from "../../../../../../services/devGuardApi";
import {
  CandidatesDTO,
  Paged,
  ReleaseDTO,
  ReleaseItem,
} from "../../../../../../types/api/api";
import { Modify } from "../../../../../../types/common";

const Releases = () => {
  const menu = useProjectMenu();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { session } = useSession();
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/releases/";

  const {
    data: releases,
    mutate,
    isLoading,
    error,
  } = useSWR<Paged<ReleaseDTO>>(uri, fetcher);
  const { data: candidates } = useSWR<CandidatesDTO>(
    uri + "candidates/",
    fetcher,
    { fallbackData: { artifacts: [], releases: [] } },
  );

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
      toast.success("Release created");
      setOpen(false);
      mutate();
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
      toast.success("Release deleted");
      mutate();
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
              session ? (
                <Button onClick={() => setOpen(true)}>Create new Release</Button>
              ) : undefined
            }
          >
            <ListRenderer
              data={releases?.data}
              isLoading={isLoading}
              error={error}
              Empty={
                <EmptyParty
                  title="Unified Releases for Versioned Software Visibility"
                  description="Releases let you group related artifacts into logical sets and track them through dashboards. This gives you a consolidated view of your software across versions, such as 1.0.0 and 2.0.0."
                />
              }
              renderItem={(release) => (
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
              )}
            />
          </Section>
        </div>
      </div>
      <ReleaseDialog
        onCreate={handleReleaseCreation}
        candidates={candidates || { artifacts: [], releases: [] }}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </Page>
  );
};

export default Releases;
