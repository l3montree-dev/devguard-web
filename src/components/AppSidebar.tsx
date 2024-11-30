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
import { OrganizationDetailsDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";

import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  Calendar,
  ChevronRight,
  Home,
  Inbox,
  PanelLeftIcon,
  PlusIcon,
  Search,
  Settings,
} from "lucide-react";
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
import { generateColor } from "@/utils/view";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

const AppSidebar = () => {
  const orgs = useStore((s) => s.organizations);

  const router = useRouter();
  const activeOrg = useOrg() ?? orgs[0];
  const updateOrganization = useStore((s) => s.updateOrganization);
  const contentTree = useStore((s) => s.contentTree);
  const { toggleSidebar } = useSidebar();
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
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentTree.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible truncate dark:text-muted-foreground"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <div className="relative -left-1 rounded-lg bg-secondary p-1">
                          <BriefcaseIcon className="z-1 relative h-5 w-5 text-foreground" />
                        </div>
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4  transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuItem>
                          <SidebarMenuSubButton
                            className="text-sm hover:no-underline dark:!text-muted-foreground"
                            href={
                              "/" + activeOrg.slug + "/projects/" + item.slug
                            }
                          >
                            <span>Overview</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuSubButton
                            className="text-sm hover:no-underline dark:!text-muted-foreground"
                            href={
                              "/" +
                              activeOrg.slug +
                              "/projects/" +
                              item.slug +
                              "/settings"
                            }
                          >
                            <span>Settings</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuItem>
                        <SidebarGroup className="rounded-lg border border-sidebar-border dark:border-0 dark:bg-card">
                          {item.assets?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  className="text-sm hover:no-underline dark:!text-muted-foreground"
                                  href={
                                    "/" +
                                    activeOrg.slug +
                                    "/projects/" +
                                    item.slug +
                                    "/assets/" +
                                    subItem.slug
                                  }
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarGroup>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          onClick={toggleSidebar}
          className="dark:text-muted-foreground"
        >
          <PanelLeftIcon className="h-5 w-5" />
          <span>Collapse Sidebar</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
