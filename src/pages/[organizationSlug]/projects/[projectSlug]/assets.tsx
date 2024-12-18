import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import ListItem from "../../../../components/common/ListItem";

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

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}

const formSchema = z.object({
  name: z.string(),
  description: z.string().optional(),

  reachableFromTheInternet: z.boolean().optional(),

  confidentialityRequirement: z.string(),
  integrityRequirement: z.string(),
  availabilityRequirement: z.string(),
});

const Index: FunctionComponent<Props> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const form = useForm<AssetDTO>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confidentialityRequirement: RequirementsLevel.Medium,
      integrityRequirement: RequirementsLevel.Medium,
      availabilityRequirement: RequirementsLevel.Medium,
    },
  });

  const projectMenu = useProjectMenu();

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
        Title={
          <span className="flex flex-row gap-2">
            <Link
              href={`/${activeOrg.slug}/projects`}
              className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            >
              {activeOrg.name}{" "}
              <Badge
                className="font-body font-normal !text-white"
                variant="outline"
              >
                Organization
              </Badge>
            </Link>
            <span className="opacity-75">/</span>
            <Link
              className="flex flex-row items-center gap-1 !text-white hover:no-underline"
              href={`/${activeOrg.slug}/projects/${project.slug}/assets`}
            >
              {project.name}
              <Badge
                className="font-body font-normal !text-white"
                variant="outline"
              >
                Project
              </Badge>
            </Link>
          </span>
        }
      >
        {project.assets.length === 0 ? (
          <EmptyList
            title="Your Assets will show up here!"
            description="You can understand assets as a software project. An asset is a
                github repository, a gitlab repository, a bundle of source code
                files, ..."
            onClick={() => setShowModal(true)}
            buttonTitle="Create new Asset"
          />
        ) : (
          <Section
            Button={
              <Button onClick={() => setShowModal(true)}>New Asset</Button>
            }
            primaryHeadline
            description={"Assets managed by the " + project.name + " project"}
            forceVertical
            title="Assets"
          >
            {project.assets.map((asset) => (
              <Link
                key={asset.id}
                href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/risk-handling`}
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
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug } = context.params!;
    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/projects/" + projectSlug + "/",
    );

    const project = await resp.json();

    return {
      props: {
        initialZustandState: {
          project,
        },
        project,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);

export default Index;
