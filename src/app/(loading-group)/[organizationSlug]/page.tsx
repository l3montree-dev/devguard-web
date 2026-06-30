"use client";

// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Page from "../../../components/Page";

import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { browserApiClient } from "../../../services/devGuardApi";
import type {
  Paged,
  ProjectDTO,
  SubGroupsAndAsset,
} from "../../../types/api/api";
import type { CreateProjectReq } from "../../../types/api/req";

import Section from "@/components/common/Section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { toast } from "@/lib/toast";

import CustomPagination from "@/components/common/CustomPagination";
import { orgHomeTourSteps } from "@/components/common/tours/org-home-tour";
import { WelcomeModal } from "@/components/common/tours/WelcomeModal";
import { ProjectForm } from "@/components/project/ProjectForm";
import Sort from "@/components/Sort";
import SubgroupsAndAssetsList, {
  checkType,
} from "@/components/SubgroupsAndAssetsList";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateOrganization } from "@/context/OrganizationContext";
import { useSession } from "@/context/SessionContext";
import { usePageTour } from "@/hooks/usePageTour";
import { isAdmin, useCurrentUserRole } from "@/hooks/useUserRole";
import AuthGuard from "@/components/AuthGuard";
import { useWelcomeTour } from "@/hooks/useWelcomeTour";
import { buildFilterSearchParams } from "@/utils/url";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import useSWR from "swr";
import EmptyParty from "../../../components/common/EmptyParty";
import ListRenderer from "../../../components/common/ListRenderer";
import { fetcher } from "../../../data-fetcher/fetcher";
import useRouterQuery from "../../../hooks/useRouterQuery";

const OrganizationHomePage: FunctionComponent = () => {
  const [viewedProject, setViewedProject] = useState<"all" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { session } = useSession();
  const [syncRunning, setSyncRunning] = useState(false);
  const searchParams = useSearchParams();

  const updateOrganization = useUpdateOrganization();

  const currentUserRole = useCurrentUserRole();

  const form = useForm<ProjectDTO>({
    mode: "onBlur",
  });

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

  const stillOnPage = useRef(true);
  const pushQuery = useRouterQuery();

  const swrUrl = isSearchActive
    ? `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/search?${queryWithState.toString()}`
    : `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/?${queryWithState.toString()}`;

  const {
    isLoading,
    data: projects,
    error,
    mutate,
  } = useSWR<Paged<SubGroupsAndAsset>>(swrUrl, async (url: string) => {
    const data = await fetcher<Paged<ProjectDTO>>(url);
    // we need to transform the data to add the resourceType field to each item, so that we can distinguish between projects and assets in the SubgroupsAndAssetsList component
    return {
      ...data,
      data: data.data.map((item) => ({
        ...item,
        resourceType: "project",
      })),
    } as Paged<SubGroupsAndAsset>;
  });

  const debouncedHandleSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
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

  const handleTriggerSync = useCallback(async () => {
    setSyncRunning(true);
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/trigger-sync`,
    );
    if (resp.ok) {
      const contentTreeResp = await browserApiClient(
        `/organizations/${decodeURIComponent(activeOrg.slug)}/content-tree`,
      );
      const contentTree = await contentTreeResp.json();
      updateOrganization((prev) => ({
        ...prev,
        contentTree: contentTree,
      }));
      toast.success("Sync triggered successfully!");
      // reload the page to show the updated projects
      if (stillOnPage.current) {
        mutate();
      }
    } else {
      toast.error("Failed to trigger sync. Please try again later.");
    }
    setSyncRunning(false);
  }, [activeOrg.slug, mutate]);

  const handleCreateProject = async (req: CreateProjectReq) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects",
      {
        method: "POST",
        body: JSON.stringify(req),
      },
    );
    if (resp.ok) {
      const res: ProjectDTO = await resp.json();
      router.push(`/${activeOrg.slug}/projects/${res.slug}`);
    } else {
      toast("Error", {
        description: "Could not create project",
      });
    }
    mutate();
  };

  const handleLazyDataFetching = useCallback(
    async (projectSlug: string, projectId: string) => {
      const base = `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/${decodeURIComponent(projectSlug)}/resources?parentId=${projectId}`;

      const resp = await browserApiClient(base);
      if (resp.ok) {
        const data = await resp.json();
        const subGroupsAndAsset = data as Paged<SubGroupsAndAsset>;

        mutate(
          (prev) => {
            if (!prev) return prev;
            // traverse the whole tree, find the correct project and update it with the new data
            const recursiveFn = (
              item: SubGroupsAndAsset,
            ): SubGroupsAndAsset => {
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
                subGroupsAndAsset:
                  subgroup?.subGroupsAndAsset?.map(recursiveFn),
              };
            };

            return {
              ...prev,
              data: prev.data.map(recursiveFn) as Array<
                ProjectDTO & {
                  resourceType: "project";
                }
              >,
            };
          },
          { revalidate: false },
        );
      } else {
        toast.error(
          "Failed to load subgroups and assets. Please try again later.",
        );
      }
    },
    [activeOrg.slug, mutate],
  );

  useEffect(() => {
    // trigger a sync on page load - if the org has an external entity provider
    if (activeOrg.externalEntityProviderId) {
      // check in localStorage if the sync was already triggered
      const lastSync = localStorage.getItem(`lastSync-${activeOrg.slug}`);
      if (
        !lastSync ||
        new Date().getTime() - new Date(lastSync).getTime() > 1000 * 60 * 60
      ) {
        // if not, trigger sync
        localStorage.setItem(
          `lastSync-${activeOrg.slug}`,
          new Date().toISOString(),
        );
        handleTriggerSync();
      }
    }
    return () => {
      stillOnPage.current = false;
    };
  }, [activeOrg.externalEntityProviderId, activeOrg.slug, handleTriggerSync]);

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

  return (
    <>
      <WelcomeModal
        open={showModal}
        onStartTour={() => handleStartTour(startTour)}
        onSkip={handleSkip}
      />
      <Page Title={null} title={""} Menu={orgMenu}>
        <Dialog open={open}>
          <DialogContent setOpen={setOpen}>
            <DialogHeader>
              <DialogTitle>Create new Group</DialogTitle>
              <DialogDescription>
                A project groups multiple software projects (repositories)
                inside a single entity. Something like: frontend and backend
              </DialogDescription>
            </DialogHeader>
            <hr />
            <FormProvider {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(handleCreateProject)}
              >
                <ProjectForm forceVerticalSections form={form} hideDangerZone />
                <DialogFooter>
                  <Button
                    data-testid="create-group-submit-button"
                    type="submit"
                    isSubmitting={form.formState.isSubmitting}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        <div>
          {activeOrg.externalEntityProviderId && (
            <div className="flex mb-4 flex-row items-center justify-end gap-2">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleTriggerSync}
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
              !activeOrg.externalEntityProviderId && (
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
            description="Groups are a way to group multiple software projects (repositories) together. Something like: frontend and backend."
            forceVertical
            title="Groups"
          >
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
                onChange={debouncedHandleSearch}
                defaultValue={searchParams?.get("search") || ""}
                placeholder="Search for projects (min. 3 characters)..."
              />
            </div>
            <div id="group-and-project-list">
              <ListRenderer
                isLoading={isLoading}
                skeletonVariant="project"
                error={error}
                data={projects?.data}
                Empty={<EmptyParty title={"No groups found"} description="" />}
                renderItem={(project) => {
                  return (
                    <div key={project.id} className="flex flex-col">
                      <div className="flex flex-col gap-2">
                        <SubgroupsAndAssetsList
                          project={
                            project as ProjectDTO & { resourceType: "project" }
                          }
                          onFetchData={handleLazyDataFetching}
                          subgroupsWithAssets={
                            (
                              project as ProjectDTO & {
                                resourceType: "project";
                              }
                            ).subGroupsAndAsset
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
