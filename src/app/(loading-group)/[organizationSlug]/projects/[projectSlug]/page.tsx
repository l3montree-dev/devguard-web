"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, FormProvider, useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { toast } from "sonner";
import useSWR from "swr";
import AssetForm, {
  AssetFormValues,
} from "../../../../../components/asset/AssetForm";
import AssetOverviewListItem from "../../../../../components/AssetOverviewListItem";
import Avatar from "../../../../../components/Avatar";
import EmptyParty from "../../../../../components/common/EmptyParty";
import ListItem from "../../../../../components/common/ListItem";
import ProjectTitle from "../../../../../components/common/ProjectTitle";
import Section from "../../../../../components/common/Section";
import Page from "../../../../../components/Page";
import { ProjectForm } from "../../../../../components/project/ProjectForm";
import { Badge } from "../../../../../components/ui/badge";
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
import { useActiveOrg } from "../../../../../hooks/useActiveOrg";
import { fetcher } from "../../../../../data-fetcher/fetcher";
import { useProjectMenu } from "../../../../../hooks/useProjectMenu";
import { useCurrentUserRole } from "../../../../../hooks/useUserRole";
import { useSession } from "../../../../../context/SessionContext";
import { browserApiClient } from "../../../../../services/devGuardApi";
import {
  AssetDTO,
  EnvDTO,
  Paged,
  ProjectDTO,
  RequirementsLevel,
  UserRole,
} from "../../../../../types/api/api";

export default function RepositoriesPage() {
  const project = useProject()!;
  const assets = project.assets;
  const organization = useOrganization();
  const { session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const { data: subgroups } = useSWR<Paged<ProjectDTO>>(
    () =>
      isOrganization(organization.organization)
        ? `/organizations/${decodeURIComponent(organization.organization.slug)}/projects?parentId=${project?.id}&pageSize=1000`
        : null,
    fetcher,
  );

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

  return (
    <>
      <Page
        Button={<Button onClick={() => setShowModal(true)}>New Asset</Button>}
        title={project.name}
        Menu={projectMenu}
        Title={<ProjectTitle />}
      >
        {assets.length === 0 && subgroups?.data.length === 0 ? (
          <EmptyParty
            description="No repositories or subgroups found"
            title="Your Repositories will show up here!"
            Button={
              session && !project.externalEntityProviderId && (
                <div className="flex flex-row justify-center gap-2">
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowProjectModal(true)}
                  >
                    Create subgroup
                  </Button>

                  <Button onClick={() => setShowModal(true)}>
                    Create new Repository
                  </Button>
                </div>
              )
            }
          />
        ) : (
          <Section
            Button={
              session && !project.externalEntityProviderId && (
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
            description={
              "Repositories managed by the " + project.name + " group"
            }
            forceVertical
            title={
              project.externalEntityProviderId
                ? "Repositories"
                : "Subgroups & Repositories"
            }
          >
            {subgroups?.data.map((subgroup) => (
              <Link
                key={subgroup.id}
                href={`/${activeOrg.slug}/projects/${subgroup.slug}`}
                className="flex flex-col gap-2 hover:no-underline"
              >
                <ListItem
                  reactOnHover
                  Title={
                    <div className="flex items-center flex-row gap-2">
                      <Avatar {...subgroup} />
                      <span>
                        {subgroup.name.replace(project.name + " /", "")}
                      </span>
                      <Badge variant={"outline"}>Subgroup</Badge>
                      {subgroup.type === "kubernetesNamespace" && (
                        <Badge variant={"outline"}>
                          <Image
                            alt="Kubernetes logo"
                            src="/assets/kubernetes.svg"
                            className="-ml-1.5 mr-2"
                            width={16}
                            height={16}
                          />
                          Kubernetes Namespace
                        </Badge>
                      )}
                    </div>
                  }
                  Description={<Markdown>{subgroup.description}</Markdown>}
                />
              </Link>
            ))}
            {assets.map((asset) => (
              <AssetOverviewListItem asset={asset} key={asset.id} />
            ))}
          </Section>
        )}
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
