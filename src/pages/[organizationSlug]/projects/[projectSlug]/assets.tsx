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
import { useProjectMenu } from "@/hooks/useProjectMenu";
import Link from "next/link";
import { toast } from "sonner";
import z from "zod";
import { withOrg } from "../../../../decorators/withOrg";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import { AssetDTO, EnvDTO, ProjectDTO } from "../../../../types/api/api";
import { CreateAssetReq } from "../../../../types/api/req";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}

const formSchema = z.object({
  name: z.string(),
  description: z.string(),

  reachableFromTheInternet: z.boolean().optional(),

  confidentialityRequirement: z.string(),
  integrityRequirement: z.string(),
  availabilityRequirement: z.string(),
});

const Index: FunctionComponent<Props> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const form = useForm<CreateAssetReq>({
    resolver: zodResolver(formSchema),
  });

  const projectMenu = useProjectMenu();

  const handleCreateAsset = async (data: CreateAssetReq) => {
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
              href={`/${activeOrg.slug}`}
              className="!text-white hover:no-underline"
            >
              {activeOrg.name}
            </Link>
            <span className="opacity-75">/</span>
            <Link
              className="!text-white hover:no-underline"
              href={`/${activeOrg.slug}/projects/${project.slug}`}
            >
              {project.name}
            </Link>
            <span className="opacity-75">/</span>
            <span className="!text-white">Assets</span>
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
            description={"Assets managed by the " + project.name + " project"}
            forceVertical
            title="Assets"
          >
            {project.assets.map((asset) => (
              <ListItem
                key={asset.id}
                title={asset.name}
                description={asset.description}
                Button={
                  <Link
                    href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    View Asset
                  </Link>
                }
              />
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
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(handleCreateAsset)}
            >
              <AssetForm form={form} />
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
        project,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
  },
);

export default Index;
