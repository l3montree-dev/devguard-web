"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import ListItem from "../../../../components/common/ListItem";
import AssetForm, { AssetFormValues } from "@/components/asset/AssetForm";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { toast } from "sonner";
import AssetOverviewListItem from "../../../../components/AssetOverviewListItem";
import Avatar from "../../../../components/Avatar";
import EmptyParty from "../../../../components/common/EmptyParty";
import Markdown from "../../../../components/common/Markdown";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import { ProjectForm } from "../../../../components/project/ProjectForm";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { browserApiClient } from "../../../../services/devGuardApi";
import {
  AssetDTO,
  EnvDTO,
  ProjectDTO,
  RequirementsLevel,
  UserRole,
} from "../../../../types/api/api";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  assets: Array<AssetDTO>;
  subgroups: Array<ProjectDTO & { assets: Array<AssetDTO> }>;
}

const RepositoryPage: FunctionComponent<Props> = ({
  project,
  subgroups,
  assets,
}) => {
  const [showModal, setShowModal] = useState(false);

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
        {assets.length === 0 && subgroups.length === 0 ? (
          <EmptyParty
            description="No repositories or subgroups found"
            title="Your Repositories will show up here!"
            Button={
              !project.externalEntityProviderId && (
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
                    New Subgroup
                  </Button>
                  <Button
                    disabled={
                      project.type !== "default" ||
                      (currentUserRole !== UserRole.Admin &&
                        currentUserRole !== UserRole.Owner)
                    }
                    onClick={() => setShowModal(true)}
                  >
                    New Repository
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
            {subgroups.map((subgroup) => (
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
          <Form {...form}>
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
          </Form>
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
          <Form {...form}>
            <form
              className="flex flex-col"
              onSubmit={form.handleSubmit(handleCreateAsset)}
            >
              <AssetForm
                forceVerticalSections
                form={form}
                showReportingRange={false}
                showSecurityRequirements={false}
                showEnvironmentalInformation={false}
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
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RepositoryPage;
