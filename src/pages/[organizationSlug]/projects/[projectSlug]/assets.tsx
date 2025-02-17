import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import ListItem from "../../../../components/common/ListItem";
import Image from "next/image";
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

import AssetForm from "@/components/asset/AssetForm";
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
import { withOrganization } from "@/decorators/withOrganization";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import z from "zod";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import {
  AssetDTO,
  EnvDTO,
  ProjectDTO,
  RequirementsLevel,
} from "../../../../types/api/api";
import { withContentTree } from "@/decorators/withContentTree";
import { ProjectForm } from "../../../../components/project/ProjectForm";
import { withProject } from "../../../../decorators/withProject";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Steps from "../../../../components/risk-identification/Steps";
import CopyCode from "../../../../components/common/CopyCode";
import PatSection from "../../../../components/risk-identification/PatSection";
import usePersonalAccessToken from "../../../../hooks/usePersonalAccessToken";
import { config } from "../../../../config";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  subprojects: Array<ProjectDTO & { assets: Array<AssetDTO> }>;
}

const formSchema = z.object({
  name: z.string(),
  description: z.string().optional(),

  reachableFromTheInternet: z.boolean().optional(),

  confidentialityRequirement: z.string(),
  integrityRequirement: z.string(),
  availabilityRequirement: z.string(),
});

const Index: FunctionComponent<Props> = ({ project, subprojects }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const form = useForm<AssetDTO>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confidentialityRequirement: RequirementsLevel.Medium,
      integrityRequirement: RequirementsLevel.Medium,
      availabilityRequirement: RequirementsLevel.Medium,

      centralFlawManagement: true,
    },
  });

  const projectForm = useForm<ProjectDTO>({
    defaultValues: {
      parentId: project.id,
    },
  });

  const { pat, onCreatePat } = usePersonalAccessToken();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showK8sModal, setShowK8sModal] = useState(false);

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

  const handleCreateAsset = async (data: AssetDTO) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project.slug +
        "/assets",
      {
        method: "POST",
        body: JSON.stringify(data),
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
        {project.assets.length === 0 && subprojects.length === 0 ? (
          <EmptyList
            title="Your Assets will show up here!"
            description="You can understand assets as a software project. An asset is a
                github repository, a gitlab repository, a bundle of source code
                files, ..."
            Button={
              <div className="flex flex-row justify-center gap-2">
                <Button
                  onClick={() => setShowK8sModal(true)}
                  variant="secondary"
                >
                  <Image
                    alt="Kubernetes logo"
                    src="/assets/kubernetes.svg"
                    className="mr-2"
                    width={24}
                    height={24}
                  />
                  Use a Kubernetes Operator to index your assets
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => setShowProjectModal(true)}
                >
                  Create new Subproject
                </Button>

                <Button onClick={() => setShowModal(true)}>
                  Create new Asset
                </Button>
              </div>
            }
          />
        ) : (
          <Section
            Button={
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
                  New Asset
                </Button>
              </div>
            }
            primaryHeadline
            description={"Assets managed by the " + project.name + " project"}
            forceVertical
            title="Subprojects & Assets"
          >
            {subprojects.map((subproject) => (
              <Link
                key={subproject.id}
                href={`/${activeOrg.slug}/projects/${subproject.slug}/assets`}
                className="flex flex-col gap-2 hover:no-underline"
              >
                <ListItem
                  reactOnHover
                  Title={subproject.name}
                  description={
                    <div className="flex flex-row gap-2">
                      {subproject.description}
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
            {project.assets.map((asset) => (
              <Link
                key={asset.id}
                href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/`}
                className="flex flex-col gap-2 hover:no-underline"
              >
                <ListItem
                  reactOnHover
                  key={asset.id}
                  Title={asset.name}
                  description={
                    <div>
                      {asset.description}{" "}
                      <div className="mt-2 flex flex-row gap-2">
                        {project.type === "kubernetesNamespace" && (
                          <Badge variant={"outline"}>
                            <Image
                              alt="Kubernetes logo"
                              src="/assets/kubernetes.svg"
                              className="-ml-1.5 mr-2"
                              width={16}
                              height={16}
                            />
                            Kubernetes Workload
                          </Badge>
                        )}
                        {asset.lastSecretScan && (
                          <Badge variant={"outline"}>Secret-Scanning</Badge>
                        )}
                        {asset.lastSastScan && (
                          <Badge variant={"outline"}>
                            Static-Application-Security-Testing
                          </Badge>
                        )}
                        {asset.lastScaScan && (
                          <Badge variant={"outline"}>
                            Software Composition Analysis
                          </Badge>
                        )}
                        {asset.lastIacScan && (
                          <Badge variant={"outline"}>
                            Infrastructure-as-Code-Scanning
                          </Badge>
                        )}
                        {asset.lastContainerScan && (
                          <Badge variant={"outline"}>Container-Scanning</Badge>
                        )}
                        {asset.lastDastScan && (
                          <Badge variant={"outline"}>Dynamic-Analysis</Badge>
                        )}
                      </div>
                    </div>
                  }
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
                          href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/settings`}
                        >
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              </Link>
            ))}
          </Section>
        )}
      </Page>
      <Dialog open={showK8sModal}>
        <DialogContent setOpen={setShowK8sModal}>
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center">
              <Image
                alt="Kubernetes logo"
                src="/assets/kubernetes.svg"
                className="mr-2"
                width={24}
                height={24}
              />
              Connect a Kubernetes Cluster
            </DialogTitle>
            <DialogDescription>
              Connect a Kubernetes cluster to DevGuard to automatically index
              your assets.
            </DialogDescription>
          </DialogHeader>
          <hr />
          <Steps>
            <div className="mb-10">
              <PatSection onCreatePat={onCreatePat} pat={pat} />
            </div>
            <Section
              className="mt-0"
              forceVertical
              title="Install the DevGuard Kubernetes Operator"
              description="The DevGuard Kubernetes Operator is a small piece of software
                that runs inside your Kubernetes cluster and indexes your
                assets. It watches for new deployments and namespaces."
            >
              <CopyCode
                codeString={`go run main.go --projectName=${activeOrg.slug + "/projects/" + project.slug} --token=${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"} --apiUrl=${config.publicDevGuardApiUrl}`}
                language="shell"
              />
            </Section>
          </Steps>
        </DialogContent>
      </Dialog>

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
              <ProjectForm forceVerticalSections form={projectForm} />
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={showModal}>
        <DialogContent setOpen={setShowModal}>
          <DialogHeader>
            <DialogTitle>Create new asset</DialogTitle>
            <DialogDescription>
              An asset is a software project you would like to manage the risks
              of.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="flex flex-col"
              onSubmit={form.handleSubmit(handleCreateAsset)}
            >
              <AssetForm forceVerticalSections form={form} />
              <DialogFooter>
                <Button type="submit" variant="default">
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

    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/projects?parentId=" + project.id,
    );

    const subprojects = await resp.json();

    return {
      props: {
        initialZustand: {
          project,
        },
        subprojects,
        project,
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
