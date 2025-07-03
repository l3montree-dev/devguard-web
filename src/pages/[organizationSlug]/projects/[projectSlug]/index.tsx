import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import ListItem from "../../../../components/common/ListItem";

import AssetForm, { AssetFormValues } from "@/components/asset/AssetForm";
import { middleware } from "@/decorators/middleware";
import { zodResolver } from "@hookform/resolvers/zod";

import EmptyList from "@/components/common/EmptyList";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import z from "zod";
import AssetOverviewListItem from "../../../../components/AssetOverviewListItem";
import CopyCode from "../../../../components/common/CopyCode";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import { ProjectForm } from "../../../../components/project/ProjectForm";
import PatSection from "../../../../components/risk-identification/PatSection";
import Steps from "../../../../components/risk-identification/Steps";
import { config } from "../../../../config";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withProject } from "../../../../decorators/withProject";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import usePersonalAccessToken from "../../../../hooks/usePersonalAccessToken";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import {
  AssetDTO,
  EnvDTO,
  PolicyEvaluation,
  ProjectDTO,
  RequirementsLevel,
} from "../../../../types/api/api";
import EmptyParty from "../../../../components/common/EmptyParty";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  assets: Array<
    AssetDTO & {
      stats: {
        compliance: Array<PolicyEvaluation>;
      };
    }
  >;
  subprojects: Array<ProjectDTO & { assets: Array<AssetDTO> }>;
}

const Index: FunctionComponent<Props> = ({ project, subprojects, assets }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const form = useForm<AssetFormValues>({
    defaultValues: {
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
        {assets.length === 0 && subprojects.length === 0 ? (
          <EmptyParty
            description="No repositories or subprojects found"
            title="Your Repositories will show up here!"
            Button={
              !project.externalEntityProviderId && (
                <div className="flex flex-row justify-center gap-2">
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowProjectModal(true)}
                  >
                    Create new Subproject
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
                    disabled={project.type !== "default"}
                    variant={"secondary"}
                    onClick={() => setShowProjectModal(true)}
                  >
                    New subproject
                  </Button>
                  <Button
                    disabled={project.type !== "default"}
                    onClick={() => setShowModal(true)}
                  >
                    New Repository
                  </Button>
                </div>
              )
            }
            primaryHeadline
            description={
              "Repositories managed by the " + project.name + " project"
            }
            forceVertical
            title={
              project.externalEntityProviderId
                ? "Repositories"
                : "Subprojects & Repositories"
            }
          >
            {subprojects.map((subproject) => (
              <Link
                key={subproject.id}
                href={`/${activeOrg.slug}/projects/${subproject.slug}`}
                className="flex flex-col gap-2 hover:no-underline"
              >
                <ListItem
                  reactOnHover
                  Title={
                    <div className="flex flex-row gap-2">
                      <span>{subproject.name}</span>
                      <Badge variant={"outline"}>Subproject</Badge>
                      {subproject.type === "kubernetesNamespace" && (
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
                  Description={<div>{subproject.description}</div>}
                  Button={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
                        })}
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <Link
                          className="!text-foreground hover:no-underline"
                          href={`/${activeOrg.slug}/projects/${subproject.slug}/settings`}
                        >
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
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
            <DialogTitle>Create new Project</DialogTitle>
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
                  onClick={() =>
                    !projectForm.formState.isSubmitting &&
                    setShowProjectModal(false)
                  }
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

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { project }) => {
    // fetch the project
    const { organizationSlug } = context.params!;
    const apiClient = getApiClientFromContext(context);

    const [subprojects, assets] = await Promise.all([
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects?parentId=" +
          project.id,
      ).then((r) => r.json()),
      // fetch the stats for all assets
      await Promise.all(
        project.assets.map(async (asset) => {
          let url =
            "/organizations/" +
            organizationSlug +
            "/projects/" +
            project.slug +
            "/assets/" +
            asset.slug;

          const compliance = (await apiClient(url + "/compliance").then((r) =>
            r.json(),
          )) as PolicyEvaluation[] | null;

          return {
            ...asset,
            stats: {
              compliance: compliance ?? [],
            },
          };
        }),
      ),
    ]);

    // get the stats for all assets

    return {
      props: {
        initialZustand: {
          project,
        },
        subprojects,
        project,
        assets,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
    project: withProject,
  },
);

export default Index;
