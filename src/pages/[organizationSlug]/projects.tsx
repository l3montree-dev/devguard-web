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

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Page from "../../components/Page";

import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../services/devGuardApi";
import { ProjectDTO } from "../../types/api/api";
import { CreateProjectReq } from "../../types/api/req";

import Section from "@/components/common/Section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { ZodConvert } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ListItem from "@/components/common/ListItem";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyList from "@/components/common/EmptyList";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import { ProjectForm } from "@/components/project/ProjectForm";

interface Props {
  projects: Array<ProjectDTO>;
}

const formSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const Home: FunctionComponent<Props> = ({ projects }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const form = useForm<ProjectDTO>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
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
      toast("Error", {
        description: "Could not create project",
      });
    }
  };

  const orgMenu = useOrganizationMenu();

  return (
    <Page
      Title={
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
      }
      title={activeOrg.name ?? "Loading..."}
      Menu={orgMenu}
    >
      <Dialog open={open}>
        <DialogContent setOpen={setOpen}>
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
              onSubmit={form.handleSubmit(handleCreateProject)}
            >
              <ProjectForm forceVerticalSections form={form} />
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div>
        {projects.length === 0 ? (
          <EmptyList
            title="Here you will see all your projects"
            description="Projects are a way to group multiple software projects (repositories) together. Something like: frontend and backend. It lets you structure your different teams and creates logical risk units."
            buttonTitle="Create your first Project"
            onClick={() => setOpen(true)}
          />
        ) : (
          <Section
            primaryHeadline
            Button={<Button onClick={() => setOpen(true)}>New Project</Button>}
            description="Projects are a way to group multiple software projects (repositories) together. Something like: frontend and backend."
            forceVertical
            title="Projects"
          >
            <div className="flex flex-col gap-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets`}
                  className="flex flex-col gap-2 hover:no-underline"
                >
                  <ListItem
                    Title={project.name}
                    description={project.description}
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
                            href={`/${activeOrg.slug}/settings`}
                          >
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                  />
                </Link>
              ))}
            </div>
          </Section>
        )}
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
    organizations: withOrgs,
    organization: withOrganization,
  },
);
