import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useState } from "react";
import Page from "../../../../components/Page";
import { withInitialState } from "../../../../decorators/withInitialState";
import { withSession } from "../../../../decorators/withSession";
import {
  getApiClient,
  getApiClientFromContext,
} from "../../../../services/flawFixApi";
import { AssetDTO, EnvDTO, ProjectDTO } from "../../../../types/api/api";
import Button from "../../../../components/common/Button";
import Modal from "../../../../components/common/Modal";
import { useForm } from "react-hook-form";
import { CreateApplicationReq } from "../../../../types/api/req";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { hasErrors } from "../../../../utils/common";
import Input from "../../../../components/common/Input";
import { useRouter } from "next/router";
import ListItem from "../../../../components/common/ListItem";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}
const Index: FunctionComponent<Props> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg()!;
  const { register, getFieldState, formState, handleSubmit } =
    useForm<CreateApplicationReq>();

  const handleCreateAsset = async (data: CreateApplicationReq) => {
    const client = getApiClient();
    const resp = await client(
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
    }
  };
  return (
    <>
      <Page
        Button={<Button onClick={() => setShowModal(true)}>New Asset</Button>}
        title={project.name}
      >
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
                View Application
              </Button>
            }
          />
        ))}
      </Page>
      <Modal open={showModal} setOpen={setShowModal} title="Create new Asset">
        <form className="text-black" onSubmit={handleSubmit(handleCreateAsset)}>
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

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
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
  }),
);
export default Index;
