import Select from "@/components/common/Select";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import ListItem from "../../../../components/common/ListItem";
import Modal from "../../../../components/common/Modal";
import { withOrg } from "../../../../decorators/withOrg";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/flawFixApi";
import { AssetDTO, EnvDTO, ProjectDTO } from "../../../../types/api/api";
import { CreateAssetReq } from "../../../../types/api/req";
import { hasErrors } from "../../../../utils/common";
import { toast } from "@/components/Toaster";
import Checkbox from "@/components/common/Checkbox";
import Link from "next/link";
import { middleware } from "@/decorators/middleware";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}
const Index: FunctionComponent<Props> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { register, getFieldState, formState, handleSubmit } =
    useForm<CreateAssetReq>();

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
      toast({
        msg: "Could not create asset",
        intent: "error",
        title: "Error",
      });
    }
  };
  return (
    <>
      <Page
        Button={<Button onClick={() => setShowModal(true)}>New Asset</Button>}
        title={project.name}
        Title={
          <span className="flex flex-row gap-2">
            <Link
              href={`/${activeOrg.slug}`}
              className="text-white hover:no-underline"
            >
              {activeOrg.name}
            </Link>
            <span className="opacity-75">/</span>
            <Link
              className="text-white hover:no-underline"
              href={`/${activeOrg.slug}/projects/${project.slug}`}
            >
              {project.name}
            </Link>
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          {project.assets.map((asset) => (
            <ListItem
              key={asset.id}
              title={asset.name}
              description={asset.description}
              Button={
                <Button
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}`}
                  variant="outline"
                  intent="primary"
                >
                  View Asset
                </Button>
              }
            />
          ))}
        </div>
      </Page>
      <Modal open={showModal} setOpen={setShowModal} title="Create new Asset">
        <form onSubmit={handleSubmit(handleCreateAsset)}>
          <Input
            variant="dark"
            label="Name"
            {...register("name", {
              required: "Please enter a name",
            })}
            error={getFieldState("name")?.error}
          />
          <div className="mt-4">
            <Input
              variant="dark"
              label="Description"
              {...register("description", {
                required: "Please enter a description",
              })}
              error={getFieldState("description")?.error}
            />
          </div>
          <div className="mt-4">
            <Select
              {...register("confidentialityRequirement")}
              label="Confidentiality Requirement"
            >
              <option value={"low"}>Low</option>
              <option value={"medium"}>Medium</option>
              <option value={"high"}>High</option>
            </Select>
          </div>
          <div className="mt-4">
            <Select
              {...register("integrityRequirement")}
              label="Integrity Requirement"
            >
              <option value={"low"}>Low</option>
              <option value={"medium"}>Medium</option>
              <option value={"high"}>High</option>
            </Select>
          </div>
          <div className="mt-4">
            <Select
              {...register("availabilityRequirement")}
              label="Availability Requirement"
            >
              <option value={"low"}>Low</option>
              <option value={"medium"}>Medium</option>
              <option value={"high"}>High</option>
            </Select>
          </div>
          <div className="mt-4">
            <Checkbox
              {...register("reachableFromTheInternet")}
              label="Reachable from the internet"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              disabled={hasErrors(formState.errors)}
              type="submit"
              variant="solid"
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
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
