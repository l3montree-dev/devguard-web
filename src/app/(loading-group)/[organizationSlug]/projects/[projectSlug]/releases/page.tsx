// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import type { ReleaseItem } from "@/types/view/release";
import React from "react";
import { toast } from "@/lib/toast";
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
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../../hooks/useProjectMenu";
import AuthGuard from "../../../../../../components/AuthGuard";
import {
  createRelease,
  deleteRelease as deleteReleaseRequest,
} from "@/services/releaseService";
import { useReleaseCandidates, useReleases } from "@/hooks/useReleases";

import type { ReleaseDTO } from "@/types/dto";

import { type Modify } from "../../../../../../types/common";
const Releases = () => {
  const menu = useProjectMenu();
  const [open, setOpen] = React.useState(false);
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const releaseScope = { organization: organizationSlug, projectSlug };

  const {
    data: releases,
    mutate,
    isLoading,
    error,
  } = useReleases(releaseScope);
  const { data: candidates } = useReleaseCandidates(releaseScope);

  const handleReleaseCreation = async (
    release: Modify<
      Omit<ReleaseDTO, "id" | "createdAt" | "updatedAt">,
      {
        items: Omit<ReleaseItem, "id" | "releaseId" | "projectId">[];
      }
    >,
  ) => {
    try {
      await createRelease(releaseScope, release as never);
    } catch {
      toast.error("Failed to create release");
      return;
    }
    toast.success("Release created");
    setOpen(false);
    mutate();
  };

  const deleteRelease = async (release: ReleaseDTO) => {
    try {
      await deleteReleaseRequest(releaseScope, release.id);
    } catch {
      toast.error("Failed to delete release");
      return;
    }
    toast.success("Release deleted");
    mutate();
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
              <AuthGuard require="admin">
                <Button onClick={() => setOpen(true)}>
                  Create new Release
                </Button>
              </AuthGuard>
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
                    <AuthGuard require="admin">
                      <Alert
                        onConfirm={() => deleteRelease(release)}
                        title="Delete Release"
                        description="Are you sure you want to delete this release? This action cannot be undone."
                      >
                        <Button variant="destructive">Delete</Button>
                      </Alert>
                    </AuthGuard>
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
                                    item.assetVersionName}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {item.childReleaseId
                                ? "Release: " + item.childReleaseName
                                : "Artifact: " +
                                  item.artifactName +
                                  "@" +
                                  item.assetVersionName}
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
