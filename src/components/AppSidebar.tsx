//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrg } from "@/hooks/useOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { OrganizationDetailsDTO, OrganizationDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import { ChevronUpDownIcon, CogIcon } from "@heroicons/react/24/outline";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ChevronRight, Loader2, PlusIcon, SidebarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { browserApiClient } from "../services/devGuardApi";
import GitProviderIcon from "./GitProviderIcon";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "./ui/sidebar";
import { uniqBy } from "lodash";
import { toast } from "sonner";

export const OrganizationDropDown = () => {
  const orgs = useStore((s) => s.organizations);
  const [orgSyncRunning, setOrgSyncRunning] = useState(false);

  const user = useCurrentUser();
  const router = useRouter();
  let activeOrg = useOrg();
  if (!activeOrg && orgs.length > 0) {
    activeOrg = orgs[0];
  }
  const updateOrganization = useStore((s) => s.updateOrganization);
  const updateOrganizations = useStore((s) => s.updateOrganizations);

  const handleActiveOrgChange = (slug: string) => () => {
    // redirect to the new slug
    const org = orgs.find((o) => o.slug === slug);
    if (org) {
      router.push(`/${org.slug}`);
      updateOrganization(org as OrganizationDetailsDTO);
    }
  };

  useEffect(() => {
    // trigger a sync on page load - if the org has an external entity provider
    if (user) {
      // check in localStorage if the sync was already triggered
      const lastSync = localStorage.getItem(`lastSync-${user.id}`);
      if (
        !lastSync ||
        new Date().getTime() - new Date(lastSync).getTime() > 1000 * 60 * 60
      ) {
        setOrgSyncRunning(true);
        // if not, trigger sync
        localStorage.setItem(`lastSync-${user.id}`, new Date().toISOString());

        browserApiClient("/trigger-sync/", {
          method: "GET",
        })
          .then((response) => {
            setOrgSyncRunning(false);

            if (response.ok) {
              toast.success("Organization synced successfully");
              // if the response is ok, update the organizations
              return response.json().then((data: Array<OrganizationDTO>) => {
                updateOrganizations(uniqBy(data.concat(orgs), "id"));
              });
            }
          })
          .catch((err) => {
            toast.error("Failed to sync organization");
            console.error("Failed to trigger organization sync", err);
            setOrgSyncRunning(false);
          });
      }
    }
  }, [user]);

  const handleNavigateToSetupOrg = () => {
    router.push(`/setup`);
  };

  return (
    <>
      <div className="flex w-full flex-row gap-2 items-center justify-between">
        {activeOrg && (
          <div className="flex flex-row items-center gap-1 text-ellipsis">
            <div className="flex flex-col gap-0 ">
              <Link href={`/${activeOrg?.slug}`}>
                <span
                  className="line-clamp-1 gap-1 inline-flex items-center  truncate text-ellipsis text-left text-lg font-display font-semibold
                text-white "
                >
                  {activeOrg.name}{" "}
                  {!activeOrg.externalEntityProviderId && (
                    <Badge className="!text-white ml-2" variant={"outline"}>
                      Organization
                    </Badge>
                  )}
                </span>
              </Link>
            </div>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg focus:ring py-2 px-1 text-white transition-all hover:bg-white/10">
            <ChevronUpDownIcon className="block h-7 w-7 p-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {orgSyncRunning && (
                <DropdownMenuItem disabled>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-sm">Syncing...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </DropdownMenuItem>
              )}
              {orgs.length !== 0 && (
                <>
                  {orgs
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((o) => (
                      <DropdownMenuItem
                        key={o.id}
                        onClick={handleActiveOrgChange(o.slug)}
                      >
                        <div className="mr-2 flex  items-center justify-center rounded-md border bg-background p-1">
                          <GitProviderIcon
                            externalEntityProviderIdOrRepositoryId={
                              o.externalEntityProviderId
                            }
                          />
                        </div>
                        {o.name}
                      </DropdownMenuItem>
                    ))}
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNavigateToSetupOrg}>
              <div className="mr-2 flex items-center justify-center rounded-md border bg-background p-1">
                <PlusIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              Create Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

const AppSidebar = () => {
  const orgs = useStore((s) => s.organizations);

  const router = useRouter();
  const activeOrg = useOrg() ?? orgs[0];
  const currentUser = useCurrentUser();
  const contentTree = useStore((s) => s.contentTree);

  const sidebar = useSidebar();

  const items = useOrganizationMenu();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="relative border-b bg-blue-950 pb-[46px] pt-3.5 dark:bg-[#ffffff]">
        <OrganizationDropDown />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={router.asPath === item.href}
                    asChild
                  >
                    <Link
                      className="truncate !text-foreground hover:no-underline"
                      href={item.href}
                    >
                      <div className="flex flex-row items-center gap-1">
                        <item.Icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {contentTree && Boolean(currentUser) && (
          <SidebarGroup>
            <SidebarGroupLabel>Groups</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentTree.map((item) => (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={router.asPath.startsWith(
                      "/" + activeOrg.slug + "/projects/" + item.slug,
                    )}
                    className="group/collapsible truncate "
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          onClick={(e) => {
                            if (!sidebar.open) {
                              router.push(
                                "/" + activeOrg.slug + "/projects/" + item.slug,
                              );
                            }
                          }}
                          tooltip={item.title}
                        >
                          <div className="flex w-full flex-row items-center justify-between ">
                            <div
                              style={{
                                width: 28,
                                height: 28,
                              }}
                              className="relative right-1 mr-1 aspect-square rounded-lg border p-1 text-center"
                            >
                              {item.title[0]}
                            </div>
                            <span className="trunace">{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4  transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.assets?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                isActive={router.asPath.startsWith(
                                  "/" +
                                    activeOrg.slug +
                                    "/projects/" +
                                    item.slug +
                                    "/assets/" +
                                    subItem.slug,
                                )}
                                asChild
                              >
                                <Link
                                  className="text-sm !text-foreground hover:no-underline"
                                  href={
                                    "/" +
                                    activeOrg.slug +
                                    "/projects/" +
                                    item.slug +
                                    "/assets/" +
                                    subItem.slug
                                  }
                                >
                                  <Image
                                    alt="git"
                                    width={20}
                                    height={20}
                                    className="opacity-100 "
                                    src={"/assets/git.svg"}
                                  />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="text-xs">
        <SidebarMenuButton asChild>
          <Link
            className="truncate !text-foreground hover:no-underline"
            href="/user-settings"
          >
            <CogIcon className="mr-1 h-5 w-5" />
            User Settings
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link
            className="truncate !text-foreground hover:no-underline"
            href="https://github.com/l3montree-dev/devguard-web"
          >
            <GitHubLogoIcon className="mr-1 h-5 w-5" />
            <span>Support</span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton className="truncate" onClick={sidebar.toggleSidebar}>
          <SidebarIcon className="mr-1 h-5 w-5" />
          Collapse Sidebar
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
