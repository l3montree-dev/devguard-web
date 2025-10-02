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
import { OrganizationDTO } from "@/types/api/api";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { uniqBy } from "lodash";
import { Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiClient } from "../services/devGuardApi";
import GitProviderIcon from "./GitProviderIcon";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSession, useUpdateSession } from "../context/SessionContext";
import { useActiveOrg } from "../hooks/useActiveOrg";

const activeOrgName = (name: string, slug: string) => {
  if (slug === "@opencode") {
    return "openCode";
  }
  if (slug === "@gitlab") {
    return "GitLab";
  }
  return name;
};
export const OrganizationDropDown = () => {
  const orgs = useSession().organizations;
  const updateOrganizations = useUpdateSession();
  const [orgSyncRunning, setOrgSyncRunning] = useState(false);

  const user = useCurrentUser();
  const router = useRouter();
  let activeOrg = useActiveOrg() as OrganizationDTO | null;
  if (!activeOrg && orgs.length > 0) {
    activeOrg = orgs[0];
  }

  const handleActiveOrgChange = (slug: string) => () => {
    // redirect to the new slug
    const org = orgs.find((o) => o.slug === slug);
    if (org) {
      router.push(`/${org.slug}`);
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
                updateOrganizations((prev) => ({
                  ...prev,
                  organizations: uniqBy(data.concat(orgs), "id"),
                }));
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
  }, [user, updateOrganizations, orgs]);

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
                <span className="line-clamp-1 gap-1 inline-flex items-center  truncate text-ellipsis text-left text-lg font-display font-semibold text-header-foreground">
                  {activeOrgName(activeOrg.name, activeOrg.slug)}{" "}
                  {!activeOrg.externalEntityProviderId && (
                    <Badge
                      className="!text-header-foreground ml-2"
                      variant={"outline"}
                    >
                      Organization
                    </Badge>
                  )}
                </span>
              </Link>
            </div>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg focus:ring py-2 px-1 text-header-foreground transition-all hover:bg-white/10">
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
