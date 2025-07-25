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
import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../components/Page";

import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../services/devGuardApi";
import { PolicyEvaluation, ProjectDTO, UserRole } from "../../types/api/api";
import { CreateProjectReq } from "../../types/api/req";

import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { toast } from "sonner";

import EmptyList from "@/components/common/EmptyList";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import EmptyParty from "../../components/common/EmptyParty";
import { ProjectBadge } from "../../components/common/ProjectTitle";
import { classNames } from "../../utils/common";
import { useParams } from "next/navigation";
import { useCurrentUserRole } from "@/hooks/useUserRole";

interface Props {
  oauth2Error?: boolean;
  projects: Array<
    ProjectDTO & {
      stats: {
        compliantAssets: number;
        totalAssets: number;
        passingControlsPercentage: number;
      };
    }
  >;
}

const Home: FunctionComponent<Props> = ({ projects, oauth2Error }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { organizationSlug } = useParams<{
    organizationSlug: string;
  }>();

  const currentUserRole = useCurrentUserRole();

  const form = useForm<ProjectDTO>({
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
      toast("Error", {
        description: "Could not create project",
      });
    }
  };

  const orgMenu = useOrganizationMenu();

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <Dialog open={open}>
        <DialogContent setOpen={setOpen}>
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
              onSubmit={form.handleSubmit(handleCreateProject)}
            >
              <ProjectForm forceVerticalSections form={form} hideDangerZone />
              <DialogFooter>
                <Button
                  type="submit"
                  isSubmitting={form.formState.isSubmitting}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {oauth2Error ? (
        <EmptyList
          title="You need to reauthorize your identity provider"
          description="Please reauthorize your identity provider to access your projects."
          Button={
            <Link
              className={classNames(
                buttonVariants({ variant: "default" }),
                "!text-black",
              )}
              href={
                `/api/devguard-tunnel/api/v1/oauth2/gitlab/` +
                organizationSlug.replace(/^@/, "")
              }
            >
              Reauthorize
            </Link>
          }
        />
      ) : (
        <div>
          {projects.length === 0 ? (
            <EmptyParty
              title="Here you will see all your groups"
              description="Projects are a way to group multiple software projects (repositories) together. Something like: frontend and backend. It lets you structure your different teams and creates logical risk units."
              Button={
                !activeOrg.externalEntityProviderId && (
                  <Button
                    disabled={
                      currentUserRole !== UserRole.Owner &&
                      currentUserRole !== UserRole.Admin
                    }
                    onClick={() => setOpen(true)}
                  >
                    New Group
                  </Button>
                )
              }
            />
          ) : (
            <Section
              primaryHeadline
              Button={
                !activeOrg.externalEntityProviderId && (
                  <Button
                    disabled={
                      currentUserRole !== UserRole.Owner &&
                      currentUserRole !== UserRole.Admin
                    }
                    onClick={() => setOpen(true)}
                  >
                    New Group
                  </Button>
                )
              }
              description="Groups are a way to group multiple software projects (repositories) together. Something like: frontend and backend."
              forceVertical
              title="Groups"
            >
              <div className="flex flex-col gap-2">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/${activeOrg.slug}/projects/${project.slug}`}
                    className="flex flex-col gap-2 hover:no-underline"
                  >
                    <ListItem
                      reactOnHover
                      Title={
                        <div className="flex flex-row items-center gap-2">
                          <span>{project.name}</span>
                        </div>
                      }
                      Description={
                        <div className="flex flex-col">
                          <span>{project.description}</span>
                          {(project.stats.totalAssets > 0 ||
                            project.type !== "default") && (
                            <div className="flex mt-4 flex-row items-center gap-2">
                              {project.type !== "default" && (
                                <ProjectBadge type={project.type} />
                              )}
                              {project.stats.totalAssets > 0 && (
                                <>
                                  {" "}
                                  <Badge
                                    variant={
                                      project.stats.compliantAssets ===
                                      project.stats.totalAssets
                                        ? "success"
                                        : "secondary"
                                    }
                                    className=""
                                  >
                                    {project.stats.compliantAssets}/
                                    {project.stats.totalAssets} assets compliant
                                  </Badge>
                                  <Badge
                                    variant={
                                      project.stats
                                        .passingControlsPercentage === 1
                                        ? "success"
                                        : "secondary"
                                    }
                                    className=""
                                  >
                                    {Math.round(
                                      project.stats.passingControlsPercentage *
                                        100,
                                    )}
                                    % controls passing
                                  </Badge>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      }
                      Button={
                        currentUserRole === UserRole.Owner ||
                        currentUserRole === UserRole.Admin ? (
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
                                href={`/${activeOrg.slug}/projects/${project.slug}/settings`}
                              >
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <></>
                        )
                      }
                    />
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </Page>
  );
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { organization }) => {
    if (organization?.oauth2Error) {
      return {
        props: {
          oauth2Error: true,
          projects: [],
        },
      };
    }
    // list the projects from the active organization
    const apiClient = getApiClientFromContext(context);

    const slug = context.params?.organizationSlug as string;

    const resp = await apiClient("/organizations/" + slug + "/projects");

    const projects = await resp.json();
    // fetch all the project stats
    const projectsWithCompliance = await Promise.all(
      projects.map(async (project: ProjectDTO) => {
        const resp = await apiClient(
          `/organizations/${slug}/projects/${project.slug}/compliance`,
        );
        // check if the response is ok
        if (!resp.ok) {
          return {
            ...project,
            stats: {
              compliantAssets: 0,
              totalAssets: 0,
              passingControlsPercentage: 0,
            },
          };
        }

        const stats = (await resp.json()) as Array<Array<PolicyEvaluation>>;

        const compliantAssets = stats.filter((asset) =>
          asset.every((r) => r.compliant),
        );

        return {
          ...project,
          stats: {
            compliantAssets: compliantAssets.length,
            totalAssets: stats.length,
            passingControlsPercentage:
              stats.flat(1).length === 0
                ? 1 // if no assets, we assume 100% compliance
                : stats.flat(1).filter((r) => r.compliant).length /
                  (stats.flat(1).length || 1),
          },
        };
      }),
    );

    return {
      props: {
        projects: projectsWithCompliance,
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
