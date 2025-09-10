"use client";

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
import { useRouter } from "next/navigation";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import Page from "../../components/Page";

import { useActiveOrg } from "../../hooks/useActiveOrg";
import { browserApiClient } from "../../services/devGuardApi";
import { Paged, ProjectDTO, UserRole } from "../../types/api/api";
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

import CustomPagination from "@/components/common/CustomPagination";
import EmptyList from "@/components/common/EmptyList";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Input } from "@/components/ui/input";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import Avatar from "../../components/Avatar";
import EmptyParty from "../../components/common/EmptyParty";
import Markdown from "../../components/common/Markdown";
import { ProjectBadge } from "../../components/common/ProjectTitle";
import { classNames } from "../../utils/common";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface Props {
  oauth2Error?: boolean;
  projects: Paged<ProjectDTO>;
  organizationSlug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

const OrganizationHomePage: FunctionComponent<Props> = ({
  projects,
  oauth2Error,
  organizationSlug,
  searchParams,
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const [syncRunning, setSyncRunning] = useState(false);

  const currentUserRole = useCurrentUserRole();
  const currentUser = useCurrentUser();
  const form = useForm<ProjectDTO>({
    mode: "onBlur",
  });

  const stillOnPage = useRef(true);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchParams = new URLSearchParams(window.location.search);

      if (e.target.value === "") {
        searchParams.delete("search");
        searchParams.delete("page"); // reset to first page
      } else if (e.target.value.length >= 3) {
        searchParams.set("search", e.target.value);
        searchParams.set("page", "1"); // reset to first page on search
      }

      const newUrl = `/${organizationSlug}?${searchParams.toString()}`;
      router.push(newUrl);
    },
    [organizationSlug, router],
  );

  // Add debounce back
  const debouncedHandleSearch = useCallback(debounce(handleSearch, 500), [
    handleSearch,
  ]);

  const handleTriggerSync = useCallback(async () => {
    setSyncRunning(true);
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/trigger-sync`,
    );
    if (resp.ok) {
      toast.success("Sync triggered successfully!");
      // reload the page to show the updated projects
      if (stillOnPage.current) {
        router.refresh();
      }
    } else {
      toast.error("Failed to trigger sync. Please try again later.");
    }
    setSyncRunning(false);
  }, [activeOrg.slug, router]);

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

  useEffect(() => {
    // trigger a sync on page load - if the org has an external entity provider
    if (activeOrg.externalEntityProviderId) {
      // check in localStorage if the sync was already triggered
      const lastSync = localStorage.getItem(`lastSync-${activeOrg.slug}`);
      if (
        !lastSync ||
        new Date().getTime() - new Date(lastSync).getTime() > 1000 * 60 * 60
      ) {
        // if not, trigger sync
        localStorage.setItem(
          `lastSync-${activeOrg.slug}`,
          new Date().toISOString(),
        );
        handleTriggerSync();
      }
    }
    return () => {
      stillOnPage.current = false;
    };
  }, [activeOrg.externalEntityProviderId, activeOrg.slug, handleTriggerSync]);

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
          {activeOrg.externalEntityProviderId && (
            <div className="flex mb-4 flex-row items-center justify-end gap-2">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleTriggerSync}
                disabled={syncRunning}
              >
                {syncRunning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Import of projects running</span>
                  </span>
                ) : (
                  <span>
                    Import projects from {activeOrg.externalEntityProviderId}
                  </span>
                )}
              </Button>
            </div>
          )}
          {projects.data.length === 0 ? (
            <div>
              <Input
                onChange={debouncedHandleSearch}
                defaultValue={searchParams.search as string}
                placeholder="Search for projects"
              />
              <EmptyParty
                title="Here you will see all your groups"
                description={
                  activeOrg.externalEntityProviderId
                    ? `Your groups are getting automatically synced from ${activeOrg.externalEntityProviderId}. The process might take some time. If you have the feeling that you are missing some of your groups, go ahead and click the 'Trigger sync'-Button.`
                    : "Groups are a way to group multiple software projects (repositories) together. Something like: frontend and backend. It lets you structure your different teams and creates logical risk units."
                }
                Button={
                  activeOrg.externalEntityProviderId ? (
                    <Button onClick={handleTriggerSync} disabled={syncRunning}>
                      {syncRunning ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">
                            Import of projects running
                          </span>
                        </span>
                      ) : (
                        <span>
                          Import projects from{" "}
                          {activeOrg.externalEntityProviderId}
                        </span>
                      )}
                    </Button>
                  ) : (
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
            </div>
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
              <div>
                <Input
                  onChange={debouncedHandleSearch}
                  defaultValue={searchParams.search as string}
                  placeholder="Search for projects"
                />
                <div className="flex mt-4 flex-col gap-2">
                  {projects.data.map((project) => (
                    <Link
                      key={project.id}
                      href={`/${activeOrg.slug}/projects/${project.slug}`}
                      className="flex flex-col gap-2 hover:no-underline"
                    >
                      <ListItem
                        reactOnHover
                        Title={
                          <div className="flex flex-row items-center gap-2">
                            <Avatar {...project} />
                            <span>{project.name}</span>
                          </div>
                        }
                        Description={
                          <div className="flex flex-col">
                            <span>
                              <Markdown>{project.description}</Markdown>
                            </span>
                            {project.type !== "default" && (
                              <div className="flex mt-4 flex-row items-center gap-2">
                                <ProjectBadge type={project.type} />
                              </div>
                            )}
                          </div>
                        }
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </Section>
          )}
          <div className="mt-4">
            <CustomPagination {...projects} />
          </div>
        </div>
      )}
    </Page>
  );
};

export default OrganizationHomePage;
