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

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import Page from "../../../components/Page";

import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { browserApiClient } from "../../../services/devGuardApi";
import { Paged, ProjectDTO, UserRole } from "../../../types/api/api";
import { CreateProjectReq } from "../../../types/api/req";

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
import { ProjectForm } from "@/components/project/ProjectForm";
import { Input } from "@/components/ui/input";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import { useSession } from "@/context/SessionContext";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import useSWR from "swr";
import Avatar from "../../../components/Avatar";
import ListRenderer from "../../../components/common/ListRenderer";
import Markdown from "../../../components/common/Markdown";
import { ProjectBadge } from "../../../components/common/ProjectTitle";
import { fetcher } from "../../../data-fetcher/fetcher";
import EmptyParty from "../../../components/common/EmptyParty";
import useRouterQuery from "../../../hooks/useRouterQuery";
import { useUpdateOrganization } from "@/context/OrganizationContext";
import { Badge } from "@/components/ui/badge";
import { buildFilterSearchParams } from "@/utils/url";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrganizationHomePage: FunctionComponent = () => {
  const [viewedProject, setViewedProject] = useState<"all" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { session } = useSession();
  const [syncRunning, setSyncRunning] = useState(false);
  const searchParams = useSearchParams();

  const updateOrganization = useUpdateOrganization();

  const currentUserRole = useCurrentUserRole();

  const form = useForm<ProjectDTO>({
    mode: "onBlur",
  });

  const queryWithState = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (state === "inactive") {
      p.append("filterQuery[state][is not]", "active");
    } else {
      p.append("filterQuery[state][is]", "active");
    }

    return p;
  }, [searchParams]);

  const stillOnPage = useRef(true);
  const pushQuery = useRouterQuery();
  const {
    isLoading,
    data: projects,
    error,
    mutate,
  } = useSWR<Paged<ProjectDTO>>(
    activeOrg
      ? `/organizations/${decodeURIComponent(activeOrg.slug)}/projects/?${queryWithState.toString()}`
      : null,
    async (url: string) =>
      fetcher<Paged<ProjectDTO>>(url).then((res) => {
        res.data = res.data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );
        return res;
      }),
  );

  const debouncedHandleSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === "") {
        pushQuery({ search: undefined, page: "1" });
      } else if (e.target.value.length >= 3) {
        pushQuery({ search: e.target.value, page: "1" });
      }
    }, 500),
    [],
  );

  const handleSetTabValue = (value: string) => {
    if (value === "all" || value === "inactive") {
      setViewedProject(value);
      pushQuery({ state: value === "inactive" ? "inactive" : undefined });
    }
  };

  const handleTriggerSync = useCallback(async () => {
    setSyncRunning(true);
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/trigger-sync`,
    );
    if (resp.ok) {
      const contentTreeResp = await browserApiClient(
        `/organizations/${decodeURIComponent(activeOrg.slug)}/content-tree`,
      );
      const contentTree = await contentTreeResp.json();
      updateOrganization((prev) => ({
        ...prev,
        contentTree: contentTree,
      }));
      toast.success("Sync triggered successfully!");
      // reload the page to show the updated projects
      if (stillOnPage.current) {
        mutate();
      }
    } else {
      toast.error("Failed to trigger sync. Please try again later.");
    }
    setSyncRunning(false);
  }, [activeOrg.slug, mutate]);

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
    mutate();
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
          <FormProvider {...form}>
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
          </FormProvider>
        </DialogContent>
      </Dialog>

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
        <Section
          primaryHeadline
          Button={
            session &&
            !activeOrg.externalEntityProviderId && (
              <Button
                disabled={
                  currentUserRole !== UserRole.Owner &&
                  currentUserRole !== UserRole.Admin
                }
                onClick={() => setOpen(true)}
              >
                Create New Group
              </Button>
            )
          }
          description="Groups are a way to group multiple software projects (repositories) together. Something like: frontend and backend."
          forceVertical
          title="Groups"
        >
          <Tabs
            defaultValue="all"
            value={viewedProject}
            onValueChange={handleSetTabValue}
          >
            <TabsList>
              <TabsTrigger value="all">Groups</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            onChange={debouncedHandleSearch}
            defaultValue={searchParams?.get("search") || ""}
            placeholder="Search for projects"
          />
          <ListRenderer
            isLoading={isLoading}
            error={error}
            data={projects?.data}
            Empty={<EmptyParty title={"No groups found"} description="" />}
            renderItem={(project) => (
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
                      {project.state === "deleted" && (
                        <Badge variant={"destructive"}>Pending deletion</Badge>
                      )}
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
            )}
          />
        </Section>
        {projects && (
          <div className="mt-4">
            <CustomPagination {...projects} />
          </div>
        )}
      </div>
    </Page>
  );
};

export default OrganizationHomePage;
