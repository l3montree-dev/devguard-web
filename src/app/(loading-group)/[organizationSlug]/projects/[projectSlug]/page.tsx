"use client";

import CustomPagination from "@/components/common/CustomPagination";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRouterQuery from "@/hooks/useRouterQuery";
import { buildFilterSearchParams } from "@/utils/url";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, FormProvider, useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { toast } from "sonner";
import useSWR from "swr";
import AssetForm, {
  type AssetFormValues,
} from "../../../../../components/asset/AssetForm";
import ProjectTitle from "../../../../../components/common/ProjectTitle";
import Section from "../../../../../components/common/Section";
import Page from "../../../../../components/Page";
import { ProjectForm } from "../../../../../components/project/ProjectForm";
import { Button } from "../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import {
  isOrganization,
  useOrganization,
} from "../../../../../context/OrganizationContext";
import { useProject } from "../../../../../context/ProjectContext";
import { useSession } from "../../../../../context/SessionContext";
import { fetcher } from "../../../../../data-fetcher/fetcher";
import { useActiveOrg } from "../../../../../hooks/useActiveOrg";
import { useProjectMenu } from "../../../../../hooks/useProjectMenu";
import { useCurrentUserRole } from "../../../../../hooks/useUserRole";
import { browserApiClient } from "../../../../../services/devGuardApi";
import type {
  AssetDTO,
  EnvDTO,
  Paged,
  ProjectDTO,
  SubGroupsAndAsset,
} from "../../../../../types/api/api";
import { RequirementsLevel, UserRole } from "../../../../../types/api/api";

import Sort from "@/components/Sort";
import SubgroupsAndAssetsList, {
  checkType,
} from "@/components/SubgroupsAndAssetsList";
import { usePageTour } from "@/hooks/usePageTour";
import { groupHomeTourSteps } from "@/components/common/tours/group-home-tour";

export default function RepositoriesPage() {
  const [viewedProject, setViewedProject] = useState<"active" | "inactive">(
    "active",
  );
  const project = useProject()!;
  const organization = useOrganization();
  const { session } = useSession();
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
    if (!isOrganization(organization.organization)) return null;
    const orgSlug = decodeURIComponent(organization.organization.slug);
    if (isSearchActive) {
      return `/organizations/${orgSlug}/projects/search?parentId=${project?.id}&${queryWithState.toString()}`;
    }
    const base = `/organizations/${orgSlug}/projects/${decodeURIComponent(project.slug)}/resources?parentId=${project?.id}`;
    const query = queryWithState.toString();
    return query ? `${base}&${query}` : base;
  })();

  const {
    data: subgroupsWithAssets,
    error,
    mutate,
  } = useSWR<Paged<SubGroupsAndAsset>>(swrUrl, async (url: string) => {
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
  });

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const form = useForm<AssetFormValues>({
    defaultValues: {
      repositoryProvider: "github",
      confidentialityRequirement: RequirementsLevel.Medium,
      integrityRequirement: RequirementsLevel.Medium,
      availabilityRequirement: RequirementsLevel.Medium,
      cvssAutomaticTicketThreshold: [], //here are the values, when enabled I enable reproting range
      riskAutomaticTicketThreshold: [],
    },
  });

  const projectForm = useForm<ProjectDTO>({
    defaultValues: {
      parentId: project.id,
    },
  });

  const currentUserRole = useCurrentUserRole();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const projectMenu = useProjectMenu();

  const isAdmin =
    currentUserRole === UserRole.Owner || currentUserRole === UserRole.Admin;
  const tourSteps = useMemo(() => groupHomeTourSteps(isAdmin), [isAdmin]);
  const { startTour } = usePageTour(tourSteps);

  useEffect(() => {
    if (searchParams?.get("startTour") === "2") {
      startTour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (value === "active" || value === "inactive") {
      setViewedProject(value);
      pushQuery({ state: value === "inactive" ? "inactive" : undefined });
    }
  };

  const handleCreateProject = async (data: ProjectDTO) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects/",
      {
        method: "POST",
        body: JSON.stringify(data),
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
        Button={<Button onClick={() => setShowModal(true)}>New Asset</Button>}
        title={project.name}
        Menu={projectMenu}
        Title={<ProjectTitle />}
      >
        <Section
          Button={
            session &&
            !project.externalEntityProviderId && (
              <div
                data-tour="subgroups-repositories-actions"
                className="flex flex-row gap-2"
              >
                <Button
                  data-tour="create-subgroup-button"
                  disabled={
                    project.type !== "default" ||
                    (currentUserRole !== UserRole.Owner &&
                      currentUserRole !== UserRole.Admin)
                  }
                  variant={"secondary"}
                  onClick={() => setShowProjectModal(true)}
                >
                  Create New Subgroup
                </Button>
                <Button
                  data-tour="create-repository-button"
                  disabled={
                    project.type !== "default" ||
                    (currentUserRole !== UserRole.Admin &&
                      currentUserRole !== UserRole.Owner)
                  }
                  onClick={() => setShowModal(true)}
                >
                  Create New Repository
                </Button>
              </div>
            )
          }
          primaryHeadline
          description={"Repositories managed by the " + project.name + " group"}
          forceVertical
          title={project.name}
        >
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
              onChange={debouncedHandleSearch}
              defaultValue={searchParams?.get("search") || ""}
              placeholder="Search for projects and repositories (min. 3 characters)..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <SubgroupsAndAssetsList
              error={error}
              subgroupsWithAssets={subgroupsWithAssets?.data}
              projectSlug={project.slug}
              onFetchData={handleLazyDataFetching}
            />
          </div>
          <div className="mt-4">
            {subgroupsWithAssets && (
              <CustomPagination {...subgroupsWithAssets} />
            )}
          </div>
        </Section>
      </Page>

      <Dialog open={showProjectModal}>
        <DialogContent setOpen={setShowProjectModal}>
          <DialogHeader>
            <DialogTitle>Create new Group</DialogTitle>
            <DialogDescription>
              A project groups multiple software projects (repositories) inside
              a single enitity. Something like: frontend and backend
            </DialogDescription>
          </DialogHeader>
          <hr />
          <FormProvider {...projectForm}>
            <form
              className="space-y-8"
              onSubmit={projectForm.handleSubmit(handleCreateProject)}
            >
              <ProjectForm
                forceVerticalSections
                form={projectForm}
                hideDangerZone
              />
              <DialogFooter>
                <Button
                  isSubmitting={projectForm.formState.isSubmitting}
                  type="submit"
                  variant="default"
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal}>
        <DialogContent setOpen={setShowModal}>
          <DialogHeader>
            <DialogTitle>Create new repository</DialogTitle>
            <DialogDescription>
              An repository is a software project you would like to manage the
              risks of.
            </DialogDescription>
          </DialogHeader>
          <hr />
          <FormProvider {...form}>
            <form
              className="flex flex-col"
              onSubmit={form.handleSubmit(handleCreateAsset)}
            >
              <AssetForm
                forceVerticalSections
                form={form}
                showVulnsManagement={false}
                showSecurityRequirements={false}
              />
              <DialogFooter>
                <Button
                  isSubmitting={form.formState.isSubmitting}
                  type="submit"
                  variant="default"
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}
