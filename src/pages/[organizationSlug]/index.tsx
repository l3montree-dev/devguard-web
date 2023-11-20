// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../components/Page";
import ProjectList from "../../components/ProjectList";
import SingleStatGroup from "../../components/SingleStatGroup";
import { toast } from "../../components/Toaster";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { withInitialState } from "../../decorators/withInitialState";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import {
  getApiClient,
  getApiClientFromContext,
} from "../../services/flawFixApi";
import { ProjectDTO } from "../../types/api/api";
import { hasErrors } from "../../utils/common";
import { CreateProjectReq } from "../../types/api/req";
interface Props {
  projects: Array<ProjectDTO>;
}

const Home: FunctionComponent<Props> = ({ projects }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const { register, handleSubmit, getFieldState, formState } =
    useForm<CreateProjectReq>({
      mode: "onBlur",
    });

  const handleCreateProject = async (req: CreateProjectReq) => {
    const client = getApiClient();

    const resp = await client(
      "/organizations/" + activeOrg?.slug + "/projects",
      {
        method: "POST",
        body: JSON.stringify(req),
      },
    );
    if (resp.ok) {
      const res: ProjectDTO = await resp.json();
      router.push(`/${activeOrg?.slug}/projects/${res.slug}`);
    } else {
      toast({
        title: "Error",
        msg: "Could not create project",
        intent: "error",
      });
    }
  };

  return (
    <Page
      Button={<Button onClick={() => setOpen(true)}>New Project</Button>}
      title={activeOrg?.name ?? "Loading..."}
    >
      <Modal title="Create new Project" open={open} setOpen={setOpen}>
        <form
          className="text-black"
          onSubmit={handleSubmit(handleCreateProject)}
        >
          <Input
            variant="dark"
            label="Name"
            error={getFieldState("name", formState).error}
            {...register("name", { required: "Project name is required" })}
          />
          <div className="mt-4">
            <Input
              variant="dark"
              label="Description"
              {...register("description")}
            />
          </div>
          <div className="flex flex-row justify-end mt-4">
            <Button disabled={hasErrors(formState.errors)} type="submit">
              Create
            </Button>
          </div>
        </form>
      </Modal>
      <div>
        <SingleStatGroup />
      </div>
      <div className="mt-4">
        <ProjectList projects={projects} />
      </div>
    </Page>
  );
};

export default Home;

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // list the projects from the active organization
    const apiClient = getApiClientFromContext(context);

    const slug = context.params?.organizationSlug as string;

    const resp = await apiClient("/organizations/" + slug + "/projects");

    return {
      props: {
        projects: await resp.json(),
      },
    };
  }),
);
