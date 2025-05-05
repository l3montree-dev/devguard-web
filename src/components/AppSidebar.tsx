// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import { OrganizationDetailsDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import {
  BuildingOfficeIcon,
  ChevronUpDownIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ChevronRight, PlusIcon, SidebarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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
import { Badge } from "./ui/badge";

export const OrganizationDropDown = () => {
  const orgs = useStore((s) => s.organizations);

  const router = useRouter();
  const activeOrg = useOrg() ?? orgs[0];
  const updateOrganization = useStore((s) => s.updateOrganization);

  const handleActiveOrgChange = (id: string) => () => {
    // redirect to the new slug
    const org = orgs.find((o) => o.id === id);
    if (org) {
      router.push(`/${org.slug}`);
      updateOrganization(org as OrganizationDetailsDTO);
    }
  };

  const handleNavigateToSetupOrg = () => {
    router.push(`/setup-organization`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg focus:ring py-2 px-1 text-white transition-all hover:bg-white/10">
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <div className="flex flex-row items-center gap-1 text-ellipsis">
            <div className="flex flex-col gap-0 ">
              <span className="line-clamp-1 gap-1 inline-flex items-center  truncate text-ellipsis text-left text-lg font-display font-semibold">
                {activeOrg?.name}{" "}
                <Badge className="!text-white" variant={"outline"}>
                  Organization
                </Badge>
              </span>
            </div>
          </div>
          <ChevronUpDownIcon className="block h-7 w-7 p-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          {orgs.length !== 0 && (
            <>
              {orgs.map((o) => (
                <DropdownMenuItem
                  key={o.id}
                  onClick={handleActiveOrgChange(o.id)}
                >
                  <div className="mr-2 flex  items-center justify-center rounded-md border bg-background p-1">
                    <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
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
      <SidebarHeader className="relative border-b bg-blue-950 pb-[46px] pt-3.5 dark:bg-[#02040a]">
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
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
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
