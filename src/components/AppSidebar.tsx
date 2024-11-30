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
import { useOrg } from "@/hooks/useOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { OrganizationDetailsDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import {
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ChartBarSquareIcon,
  ChevronUpDownIcon,
  CogIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";
import { ChevronRight, PlusIcon } from "lucide-react";
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
} from "./ui/sidebar";

const AppSidebar = () => {
  const orgs = useStore((s) => s.organizations);

  const router = useRouter();
  const activeOrg = useOrg() ?? orgs[0];
  const updateOrganization = useStore((s) => s.updateOrganization);
  const contentTree = useStore((s) => s.contentTree);

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

  const items = useOrganizationMenu();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="pb-[46px] pt-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size={"lg"}
              className="rounded-lg data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex w-full flex-row items-center justify-between gap-1">
                <div className="flex flex-row items-center gap-1 overflow-hidden text-ellipsis">
                  <div className="size-8 flex aspect-square flex-row items-center justify-center rounded-lg bg-secondary p-1.5 text-foreground dark:text-white">
                    <BuildingOffice2Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="line-clamp-1 inline-block max-w-[155px] truncate text-ellipsis text-left text-sm font-semibold">
                      {activeOrg?.name}
                    </span>
                    <span className="truncate text-left text-xs">
                      Organization
                    </span>
                  </div>
                </div>

                <ChevronUpDownIcon className="block h-7 w-7 p-1" />
              </div>
            </SidebarMenuButton>
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
                      className="!text-foreground hover:no-underline"
                      href={item.href}
                    >
                      <div className="flex flex-row items-center gap-1">
                        <item.Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      <SidebarMenuButton tooltip={item.title}>
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4  transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={
                              router.asPath ===
                              "/" + activeOrg.slug + "/projects/" + item.slug
                            }
                            className="text-sm !text-foreground hover:no-underline"
                            href={
                              "/" + activeOrg.slug + "/projects/" + item.slug
                            }
                          >
                            <ChartBarSquareIcon className="h-5 w-5 opacity-75" />
                            <span>Overview</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={
                              router.asPath ===
                              "/" +
                                activeOrg.slug +
                                "/projects/" +
                                item.slug +
                                "/settings"
                            }
                            className="text-sm !text-foreground hover:no-underline"
                            href={
                              "/" +
                              activeOrg.slug +
                              "/projects/" +
                              item.slug +
                              "/settings"
                            }
                          >
                            <CogIcon className="h-5 w-5 opacity-75" />
                            <span>Settings</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {item.assets?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={router.asPath.includes(subItem.slug)}
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
      </SidebarContent>
      <SidebarFooter className="text-xs">
        <SidebarMenuButton asChild>
          <Link
            className="!text-foreground hover:no-underline"
            href="/user-settings"
          >
            <CogIcon className="h-5 w-5" />
            User Settings
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link
            className="!text-foreground hover:no-underline"
            href="https://github.com/l3montree-dev/devguard-web"
          >
            <LifebuoyIcon className="h-5 w-5" />
            <span>Support</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
