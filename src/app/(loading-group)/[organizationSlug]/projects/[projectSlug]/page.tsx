"use client";

import CustomPagination from "@/components/common/CustomPagination";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRouterQuery from "@/hooks/useRouterQuery";
import { buildFilterSearchParams } from "@/utils/url";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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

export default function RepositoriesPage() {
  const [viewedProject, setViewedProject] = useState<"active" | "inactive">(
    "active",
  );
  const project = useProject()!;
  const organization = useOrganization();
  const { session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const searchParams = useSearchParams();

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

  const {
    data: subgroupsWithAssets,
    error,
    mutate,
  } = useSWR<Paged<SubGroupsAndAsset>>(() => {
    if (!isOrganization(organization.organization)) return null;
    const base = `/organizations/${decodeURIComponent(organization.organization.slug)}/projects/${decodeURIComponent(project.slug)}/resources?parentId=${project?.id}`;
    const query = queryWithState.toString();
    return query ? `${base}&${query}` : base;
  }, fetcher);

  const pushQuery = useRouterQuery();

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

  const debouncedHandleSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === "") {
        mutate();
      } else if (e.target.value.length >= 3) {
        handleSearchChange(e.target.value);
      }
    }, 500),
    [],
  );

  const handleSearchChange = async (search: string) => {
    const params = buildFilterSearchParams(searchParams);
    params.set("search", search);
    params.set("page", "1");

    const resp = await browserApiClient(
      `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/search?parentId=${project?.id}&${params.toString()}`,
    );
    if (!resp.ok) {
      toast.error("Failed to search projects. Please try again later.");
      return;
    }

    const raw = (await resp.json()) as Paged<
      ProjectDTO & { subGroupsAndAsset: SubGroupsAndAsset[] | null }
    >;

    const data: Paged<SubGroupsAndAsset> = {
      ...raw,
      data: raw.data.flatMap((item) => item.subGroupsAndAsset ?? []),
    };

    mutate(data, { revalidate: false });
  };

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

  const handleLazyDataFetching = async (
    projectSlug: string,
    projectId: string,
  ) => {
    const base = `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/${decodeURIComponent(projectSlug)}/resources?parentId=${projectId}`;

    const resp = await browserApiClient(base);
    if (resp.ok) {
      const data = await resp.json();
      const subGroupsAndAsset = data as Paged<SubGroupsAndAsset>;

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
              return { ...subgroup, subGroupsAndAsset: subGroupsAndAsset.data };
            }

            return {
              ...subgroup,
              subGroupsAndAsset: subgroup?.subGroupsAndAsset?.map(recursiveFn),
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
  };

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
              <div className="flex flex-row gap-2">
                <Button
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
          <Tabs
            defaultValue="active"
            value={viewedProject}
            onValueChange={handleSetTabValue}
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
              placeholder="Search for projects and repositories..."
            />
          </div>
          <SubgroupsAndAssetsList
            error={error}
            subgroupsWithAssets={subgroupsWithAssets?.data}
            projectSlug={project.slug}
            onFetchData={handleLazyDataFetching}
          />

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
