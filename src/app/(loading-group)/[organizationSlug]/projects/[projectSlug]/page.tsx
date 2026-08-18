"use client";

import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRouterQuery from "@/hooks/useRouterQuery";
import { toast } from "@/lib/toast";
import { buildFilterSearchParams } from "@/utils/url";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import type { AssetFormValues } from "../../../../../components/asset/AssetForm";
import { CreateRepositoryForm } from "../../../../../components/asset/CreateRepositoryForm";
import AuthGuard from "../../../../../components/AuthGuard";
import ProjectTitle from "../../../../../components/common/ProjectTitle";
import Section from "../../../../../components/common/Section";
import Page from "../../../../../components/Page";
import { CreateGroupForm } from "../../../../../components/project/CreateGroupForm";
import { CreateSubgroupOrRepoForm } from "../../../../../components/project/CreateSubgroupOrRepoForm";
import { Button } from "../../../../../components/ui/button";
import { useOrganization } from "../../../../../context/OrganizationContext";
import { useProject } from "../../../../../context/ProjectContext";
import { fetcher } from "../../../../../data-fetcher/fetcher";
import { useActiveOrg } from "../../../../../hooks/useActiveOrg";
import { useProjectMenu } from "../../../../../hooks/useProjectMenu";
import { isAdmin, useCurrentUserRole } from "../../../../../hooks/useUserRole";
import { browserApiClient } from "../../../../../services/devGuardApi";
import type {
  AssetDTO,
  EnvDTO,
  Paged,
  ProjectDTO,
  SubGroupsAndAsset,
} from "../../../../../types/api/api";
import type { CreateProjectReq } from "../../../../../types/api/req";

import { groupHomeTourSteps } from "@/components/common/tours/group-home-tour";
import Sort from "@/components/Sort";
import SubgroupsAndAssetsList, {
  checkType,
} from "@/components/SubgroupsAndAssetsList";
import { useAutoTour } from "@/hooks/useAutoTour";

export default function RepositoriesPage() {
  const [viewedProject, setViewedProject] = useState<"active" | "inactive">(
    "active",
  );
  const project = useProject()!;
  const organization = useOrganization();
  const [showModal, setShowModal] = useState(false);
  const searchParams = useSearchParams();

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

  const swrUrl = (() => {
    if (!organization.organization) return null;
    const orgSlug = decodeURIComponent(organization.organization.slug);
    if (isSearchActive) {
      return `/organizations/${orgSlug}/projects/search?parentId=${project?.id}&${queryWithState.toString()}`;
    }
    const base = `/organizations/${orgSlug}/projects/${decodeURIComponent(project.slug)}/resources?parentId=${project?.id}`;
    const query = queryWithState.toString();
    return query ? `${base}&${query}` : base;
  })();

  const {
    isLoading,
    data: subgroupsWithAssets,
    error,
    mutate,
  } = useSWR<Paged<SubGroupsAndAsset>>(
    swrUrl,
    async (url: string) => {
      if (isSearchActive) {
        const raw = (await fetcher(url)) as Paged<
          ProjectDTO & { subGroupsAndAsset: SubGroupsAndAsset[] | null }
        >;
        return {
          ...raw,
          data: raw.data.flatMap((item) => item.subGroupsAndAsset ?? []),
        };
      }
      return fetcher<Paged<SubGroupsAndAsset>>(url);
    },
    { keepPreviousData: true },
  );

  const router = useRouter();
  const activeOrg = useActiveOrg();

  const currentUserRole = useCurrentUserRole();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const projectMenu = useProjectMenu();

  // a filtered list that comes back empty means "no matches", not "nothing created yet",
  // so the inline create form is only offered on the unfiltered, genuinely empty group
  const showInlineCreateForm =
    subgroupsWithAssets?.total === 0 &&
    !isSearchActive &&
    searchParams?.get("state") !== "inactive" &&
    !project.externalEntityProviderId &&
    isAdmin(currentUserRole);

  const tourSteps = useMemo(
    () => groupHomeTourSteps(isAdmin(currentUserRole), !showInlineCreateForm),
    [currentUserRole, showInlineCreateForm],
  );
  useAutoTour("group-home", tourSteps);

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
    if (value === "active" || value === "inactive") {
      setViewedProject(value);
      pushQuery({ state: value === "inactive" ? "inactive" : undefined });
    }
  };

  const handleCreateProject = async (data: CreateProjectReq) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects/",
      {
        method: "POST",
        body: JSON.stringify({ ...data, parentId: project.id }),
      },
    );
    if (resp.ok) {
      const res: ProjectDTO = await resp.json();
      setShowProjectModal(false);
      // navigate to the new application
      router.push(`/${activeOrg.slug}/projects/${res.slug}`);
    } else {
      toast("Error", { description: "Could not create project" });
    }
  };

  const handleCreateAsset = async (data: AssetFormValues) => {
    const modifiedData: AssetDTO = {
      ...data,
      cvssAutomaticTicketThreshold: data.cvssAutomaticTicketThreshold
        ? data.cvssAutomaticTicketThreshold[0]
        : 2,

      riskAutomaticTicketThreshold: data.riskAutomaticTicketThreshold
        ? data.riskAutomaticTicketThreshold[0]
        : 2,
    };
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project.slug +
        "/assets",
      {
        method: "POST",
        body: JSON.stringify(modifiedData),
      },
    );
    if (resp.ok) {
      const res: AssetDTO & {
        env: Array<EnvDTO>;
      } = await resp.json();
      setShowModal(false);
      // navigate to the new application
      router.push(
        `/${activeOrg.slug}/projects/${project.slug}/assets/${res.slug}`,
      );
    } else {
      toast("Error", { description: "Could not create asset" });
    }
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
              data: prev.data.map(recursiveFn) as SubGroupsAndAsset[],
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

  return (
    <>
      <Page
        Button={
          !showInlineCreateForm && (
            <Button onClick={() => setShowModal(true)}>New Asset</Button>
          )
        }
        title={project.name}
        Menu={projectMenu}
        Title={<ProjectTitle />}
      >
        <Section
          Button={
            !project.externalEntityProviderId &&
            !showInlineCreateForm && (
              <AuthGuard require="admin">
                <div className="flex flex-row gap-2">
                  <Button
                    data-tour="create-subgroup-button"
                    variant={"secondary"}
                    onClick={() => setShowProjectModal(true)}
                    data-testid="create-subgroup-button"
                  >
                    Create New Subgroup
                  </Button>
                  <Button
                    data-testid="create-repository-button"
                    data-tour="create-repository-button"
                    onClick={() => setShowModal(true)}
                  >
                    Create New Repository
                  </Button>
                </div>
              </AuthGuard>
            )
          }
          primaryHeadline
          description={
            "Repositories managed by the " + project.name + " group."
          }
          forceVertical
          title={project.name}
        >
          {!showInlineCreateForm && (
            <>
              <div className="flex items-center gap-4">
                <Tabs
                  defaultValue="active"
                  value={viewedProject}
                  onValueChange={handleSetTabValue}
                  className={`${isSearchActive ? "pointer-events-none disabled" : ""}`}
                >
                  <TabsList>
                    <TabsTrigger value="active">
                      {project.externalEntityProviderId
                        ? "Repositories"
                        : "Subgroups & Repositories"}
                    </TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
                {isSearchActive && (
                  <span className="text-xs text-warning bg-warning-muted border border-warning-border rounded px-2 py-1">
                    Filter and sorting options are disabled while searching
                  </span>
                )}
              </div>
              <div data-tour="group-filter" className="flex gap-2">
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
                  placeholder="Search for projects and repositories (min. 3 characters)..."
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            <SubgroupsAndAssetsList
              error={error}
              isLoading={isLoading}
              subgroupsWithAssets={subgroupsWithAssets?.data}
              projectSlug={project.slug}
              onFetchData={handleLazyDataFetching}
              Empty={
                showInlineCreateForm ? (
                  <CreateSubgroupOrRepoForm
                    onCreateRepository={handleCreateAsset}
                    onCreateSubgroup={handleCreateProject}
                  />
                ) : (
                  <EmptyParty title="No repositories found" description="" />
                )
              }
            />
          </div>
          <div className="mt-4">
            {subgroupsWithAssets && (
              <CustomPagination {...subgroupsWithAssets} />
            )}
          </div>
        </Section>
      </Page>

      <CreateGroupForm
        variant="dialog"
        open={showProjectModal}
        setOpen={setShowProjectModal}
        onSubmit={handleCreateProject}
        title="Create new Subgroup"
        description="Subgroups can help to organize your bigger software projects. You can separate your backend, frontend and website repositories for example."
      />

      <CreateRepositoryForm
        variant="dialog"
        open={showModal}
        setOpen={setShowModal}
        onSubmit={handleCreateAsset}
      />
    </>
  );
}
