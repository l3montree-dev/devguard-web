// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Page from "../../../components/Page";

import { useActiveOrg } from "../../../hooks/useActiveOrg";
import type { Paged } from "@/types/view/pagination";
import type { SubGroupProject, SubGroupsAndAsset } from "@/types/view/project";
import type { ProjectCreateRequest } from "@/services/projectService";

import Section from "@/components/common/Section";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { toast } from "@/lib/toast";

import CustomPagination from "@/components/common/CustomPagination";
import { orgHomeTourSteps } from "@/components/common/tours/orgHomeTour";
import { WelcomeModal } from "@/components/common/tours/WelcomeModal";
import { CreateGroupForm } from "@/components/project/CreateGroupForm";
import Sort from "@/components/Sort";
import SubgroupsAndAssetsList, {
  checkType,
} from "@/components/SubgroupsAndAssetsList";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrgTriggerSync } from "@/hooks/useOrgTriggerSync";
import { usePageTour } from "@/hooks/usePageTour";
import { isAdmin, useCurrentUserRole } from "@/hooks/useUserRole";
import AuthGuard from "@/components/AuthGuard";
import { useWelcomeTour } from "@/hooks/useWelcomeTour";
import { buildFilterSearchParams } from "@/utils/url";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import EmptyParty from "../../../components/common/EmptyParty";
import ListRenderer from "../../../components/common/ListRenderer";
import useRouterQuery from "../../../hooks/useRouterQuery";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { createProject, listProjectResources } from "@/services/projectService";

const OrganizationHomePage: FunctionComponent = () => {
  const [viewedProject, setViewedProject] = useState<"all" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const searchParams = useSearchParams();

  const currentUserRole = useCurrentUserRole();

  const searchQuery = searchParams?.get("search") ?? "";
  const isSearchActive = searchQuery.length >= 3;

  const queryWithState = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (state === "inactive") {
      p.append("filterQuery[state][is not]", "active");
    } else {
      p.append("filterQuery[state][is]", "active");
    }

    return p;
  }, [searchParams]);

  const pushQuery = useRouterQuery();

  const {
    isLoading,
    data: projects,
    error,
    mutate,
  } = useOrgProjects(activeOrg.slug, queryWithState, isSearchActive);

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (value === "") {
          pushQuery({ search: undefined, page: 1 });
        } else if (value.length >= 3) {
          pushQuery({ search: value, page: 1 });
        }
      }, 500),
    [pushQuery],
  );

  const handleSetTabValue = (value: string) => {
    if (value === "all" || value === "inactive") {
      setViewedProject(value);
      pushQuery({ state: value === "inactive" ? "inactive" : undefined });
    }
  };

  const { triggerSync, syncRunning } = useOrgTriggerSync(mutate);

  const handleCreateProject = async (req: ProjectCreateRequest) => {
    try {
      const res = await createProject(activeOrg.slug, req);
      router.push(`/${activeOrg.slug}/projects/${res.slug}`);
    } catch {
      toast("Error", {
        description: "Could not create project",
      });
    }
    mutate();
  };

  const handleLazyDataFetching = useCallback(
    async (projectSlug: string, projectId: string) => {
      const subGroupsAndAsset = (await listProjectResources(
        {
          organization: decodeURIComponent(activeOrg.slug),
          projectSlug: decodeURIComponent(projectSlug),
        },
        projectId,
      )) as unknown as Paged<SubGroupsAndAsset>;

      mutate(
        (prev) => {
          if (!prev) return prev;
          // traverse the whole tree, find the correct project and update it with the new data
          const recursiveFn = (item: SubGroupsAndAsset): SubGroupsAndAsset => {
            const { asset, subgroup } = checkType(item);
            if (asset != null) {
              return asset;
            }

            if (subgroup.id === projectId) {
              return {
                ...subgroup,
                subGroupsAndAsset: subGroupsAndAsset.data,
              };
            }

            return {
              ...subgroup,
              subGroupsAndAsset: subgroup?.subGroupsAndAsset?.map(recursiveFn),
            };
          };

          return {
            ...prev,
            data: prev.data.map(recursiveFn),
          };
        },
        { revalidate: false },
      );
    },
    [activeOrg.slug, mutate],
  );

  const importingIntoEmptyList = syncRunning && projects?.data.length === 0;

  const orgMenu = useOrganizationMenu();

  const tourSteps = useMemo(
    () => orgHomeTourSteps(isAdmin(currentUserRole)),
    [currentUserRole],
  );
  const { startTour } = usePageTour(tourSteps);
  const { showModal, handleStartTour, handleSkip } = useWelcomeTour();

  useEffect(() => {
    if (searchParams?.get("startTour") === "org-home") {
      startTour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // a filtered list that comes back empty means "no matches", not "nothing created yet"
  const showInlineCreateForm =
    projects?.total === 0 &&
    !isSearchActive &&
    searchParams?.get("state") !== "inactive" &&
    !activeOrg.externalEntityProviderId &&
    isAdmin(currentUserRole);

  return (
    <>
      <WelcomeModal
        open={showModal}
        onStartTour={() => handleStartTour(startTour)}
        onSkip={handleSkip}
      />
      <Page Title={null} title={""} Menu={orgMenu}>
        <CreateGroupForm
          variant="dialog"
          open={open}
          setOpen={setOpen}
          onSubmit={handleCreateProject}
        />

        <div>
          {activeOrg.externalEntityProviderId && (
            <div className="flex mb-4 flex-row items-center justify-end gap-2">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => triggerSync()}
                disabled={syncRunning}
              >
                {syncRunning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Import of projects running</span>
                  </span>
                ) : (
                  <span>
                    Import projects from {activeOrg.externalEntityProviderId}
                  </span>
                )}
              </Button>
            </div>
          )}
          <Section
            primaryHeadline
            Button={
              !activeOrg.externalEntityProviderId &&
              !showInlineCreateForm && (
                <AuthGuard require="admin">
                  <Button
                    data-testid="create-group-button"
                    data-tour="create-group-button"
                    onClick={() => setOpen(true)}
                  >
                    Create New Group
                  </Button>
                </AuthGuard>
              )
            }
            description={
              "Groups managed by the " + activeOrg.name + " organization."
            }
            forceVertical
            title="Groups"
          >
            {!showInlineCreateForm && (
              <>
                <div className="flex items-center gap-4">
                  <Tabs
                    defaultValue="all"
                    value={viewedProject}
                    onValueChange={handleSetTabValue}
                    className={`${isSearchActive ? "pointer-events-none disabled" : ""}`}
                  >
                    <TabsList>
                      <TabsTrigger value="all">Groups</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {isSearchActive && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded px-2 py-1">
                      Filter and sorting options are disabled while searching
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Sort
                    sortOptions={[
                      { label: "Name", value: "name" },
                      { label: "Created at", value: "created_at" },
                      { label: "Updated at", value: "updated_at" },
                    ]}
                  />

                  <Input
                    className="h-11"
                    onChange={(e) => debouncedHandleSearch(e.target.value)}
                    defaultValue={searchParams?.get("search") || ""}
                    placeholder="Search for projects (min. 3 characters)..."
                  />
                </div>
              </>
            )}
            <div id="group-and-project-list">
              <ListRenderer
                isLoading={isLoading || importingIntoEmptyList}
                skeletonVariant="project"
                error={error}
                data={projects?.data}
                Empty={
                  showInlineCreateForm ? (
                    <CreateGroupForm
                      variant="inline"
                      onSubmit={handleCreateProject}
                    />
                  ) : (
                    <EmptyParty title={"No groups found"} description="" />
                  )
                }
                renderItem={(project) => {
                  return (
                    <div key={project.id} className="flex flex-col">
                      <div className="flex flex-col gap-2">
                        <SubgroupsAndAssetsList
                          project={project as SubGroupProject}
                          onFetchData={handleLazyDataFetching}
                          subgroupsWithAssets={
                            (project as SubGroupProject).subGroupsAndAsset
                          }
                          projectSlug={project.slug}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </Section>
          {projects && (
            <div className="mt-4">
              <CustomPagination {...projects} />
            </div>
          )}
        </div>
      </Page>
    </>
  );
};

export default OrganizationHomePage;
