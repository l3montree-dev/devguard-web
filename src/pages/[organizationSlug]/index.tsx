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
import { toast } from "../../components/Toaster";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { withOrg } from "../../decorators/withOrg";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../services/flawFixApi";
import { ProjectDTO } from "../../types/api/api";
import { CreateProjectReq } from "../../types/api/req";
import { hasErrors } from "../../utils/common";
import { middleware } from "@/decorators/middleware";
import { PlusIcon } from "@heroicons/react/24/solid";
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
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects",
      {
        method: "POST",
        body: JSON.stringify(req),
      },
    );
    if (resp.ok) {
      const res: ProjectDTO = await resp.json();
      router.push(`/${activeOrg.slug}/projects/${res.slug}`);
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
      Button={
        <Button intent="primary" onClick={() => setOpen(true)}>
          New Project
        </Button>
      }
      title={activeOrg.name ?? "Loading..."}
    >
      <Modal title="Create new Project" open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleCreateProject)}>
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
          <div className="mt-4 flex flex-row justify-end">
            <Button disabled={hasErrors(formState.errors)} type="submit">
              Create
            </Button>
          </div>
        </form>
      </Modal>
      <div>
        {projects.length === 0 && (
          <div className="flex min-h-screen justify-center py-24">
            <div className="flex w-2/6 flex-col">
              <h2 className="text-base font-semibold leading-6 text-yellow-400">
                Create your first Project
              </h2>
              <p className="mb-8 mt-1 text-sm text-gray-400">
                You haven’t created a project yet. Get started by creating your
                first project.
              </p>
              <form onSubmit={handleSubmit(handleCreateProject)}>
                <Input
                  variant="dark"
                  label="Name*"
                  error={getFieldState("name", formState).error}
                  {...register("name", {
                    required: "Project name is required",
                  })}
                />
                <div className="mt-4">
                  <Input
                    variant="dark"
                    label="Description"
                    {...register("description")}
                  />
                </div>
                <div className="mt-4 flex flex-row justify-end">
                  <Button disabled={hasErrors(formState.errors)} type="submit">
                    Create
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ProjectList projects={projects} />
      </div>
    </Page>
  );
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // list the projects from the active organization
    const apiClient = getApiClientFromContext(context);

    const slug = context.params?.organizationSlug as string;

    const resp = await apiClient("/organizations/" + slug + "/projects");

    const projects = await resp.json();

    return {
      props: {
        projects,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
  },
);
