// Copyright (C) 2023 Tim Bastin, l3montree GmbH
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
import { classNames } from "@/utils/common";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import AppSidebar, { OrganizationDropDown } from "./AppSidebar";
import UserNav from "./navigation/UserNav";
import { SidebarProvider } from "./ui/sidebar";
import { useStore } from "@/zustand/globalStoreProvider";
import useDimensions from "@/hooks/useDimensions";
import { HEADER_HEIGHT } from "@/const/viewConstants";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { useActiveAsset } from "../hooks/useActiveAsset";
import GitProviderIcon from "./GitProviderIcon";
import { providerIdToBaseURL } from "../utils/externalProvider";
import { useParams } from "next/navigation";

interface Props {
  title: string;
  Title?: React.ReactNode;
  children: React.ReactNode;
  Button?: React.ReactNode;
  Menu?: Array<{
    title: string;
    href: string;
    Icon: FunctionComponent<{ className: string }>;
    isActive?: boolean;
  }>;
  fullscreen?: boolean;
}

const EntityProviderImage = ({ provider }: { provider: string }) => {
  if (provider === "@official") {
    return (
      <Image
        src="/assets/gitlab.svg"
        alt="Official Logo"
        width={30}
        height={30}
      />
    );
  } else if (provider === "@opencode") {
    return (
      <Image
        src="/logos/opencode.svg"
        alt="OpenCode Logo"
        width={20}
        height={20}
        className="scale-175 relative right-[1px]"
      />
    );
  }
  return (
    <Image
      src="/logo_inverse_icon.svg"
      alt="DevGuard Logo"
      width={30}
      height={30}
    />
  );
};

const slugToProvider = (slug: string | undefined) => {
  return slug?.replace("@", "");
};

const EntityProviderLinkBanner = () => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const activeAsset = useActiveAsset();

  const { organizationSlug, projectSlug, assetSlug } = useParams<{
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  }>();

  if (!activeOrg && !activeProject && !activeAsset) {
    return null;
  }

  if (assetSlug && activeAsset && activeAsset.externalEntityProviderId) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={
            providerIdToBaseURL(activeAsset.externalEntityProviderId) +
            `/-/p/` +
            activeAsset.externalEntityId
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {activeProject.name} / {activeAsset.name}
        </Link>
      </div>
    );
  }

  if (projectSlug && activeProject && activeProject.externalEntityProviderId) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={
            providerIdToBaseURL(activeOrg.externalEntityProviderId) +
            `/-/g/` +
            activeProject.externalEntityId
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {activeProject.name}
        </Link>
      </div>
    );
  }

  if (organizationSlug?.startsWith("@")) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={providerIdToBaseURL(organizationSlug?.replace("@", ""))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {organizationSlug?.replace("@", "")}
        </Link>
      </div>
    );
  }

  return <div></div>;
};

const Main: FunctionComponent<Props> = ({
  title,
  Title,
  children,
  Menu,
  fullscreen,
}) => {
  const router = useRouter();
  const isSidebarOpen = useStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const dimensions = useDimensions();
  const activeOrg = useActiveOrg();
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  useEffect(() => {
    // check local storage
    const open = localStorage.getItem("sidebarOpen");
    setSidebarOpen(open === "true");
  }, []);

  return (
    <SidebarProvider
      onOpenChange={(o) => {
        localStorage.setItem("sidebarOpen", o.toString());
        setSidebarOpen(o);
      }}
      open={isSidebarOpen}
    >
      {/*<AppSidebar /> */}
      <main className="flex-1 font-body">
        <header
          className={classNames(
            "relative z-20 flex min-h-[109px] items-center justify-between border-b bg-blue-950 px-4 pt-5 dark:bg-[#02040a] sm:px-6 lg:px-8",
            Boolean(Menu) ? "pb-3" : "pb-5",
          )}
        >
          <div className="mx-auto w-full max-w-screen-2xl">
            <div className="flex flex-row items-center gap-4">
              <Link href={`/${activeOrg?.slug}`}>
                <EntityProviderImage provider={activeOrg?.slug || ""} />
              </Link>
              <div>
                <OrganizationDropDown />
              </div>
              <div className="flex w-full flex-row items-center justify-between">
                <h1 className="font-display text-lg font-semibold leading-7 text-white">
                  {Title ?? title}
                </h1>
                <UserNav />
              </div>
            </div>
            {Menu !== undefined && (
              <div className="flex flex-row items-end gap-6 text-sm">
                {Menu.map((item) => (
                  <Link
                    className={classNames(
                      "cursor:pointer relative hover:no-underline",
                    )}
                    key={item.title}
                    href={item.href}
                  >
                    {(item.isActive || router.asPath == item.href) && (
                      <div className="absolute -bottom-3 -left-2 -right-2 h-0.5 bg-amber-400" />
                    )}
                    <div className="mt-4 flex flex-row items-center gap-1">
                      <item.Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-white ">{item.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>
        <EntityProviderLinkBanner />
        <div
          style={{ minHeight: dimensions.height - HEADER_HEIGHT - 100 }}
          className={classNames(
            !fullscreen &&
              "mx-auto max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
          )}
        >
          {children}
        </div>
        <footer className="mx-auto max-w-screen-xl px-6 pb-8 text-sm text-muted-foreground lg:px-8">
          <div className="mb-2 flex flex-row gap-5">
            <Link
              className="!text-muted-foreground"
              target="_blank"
              href="https://github.com/l3montree-dev/devguard"
            >
              GitHub
            </Link>
            <Link
              className="!text-muted-foreground"
              target="_blank"
              href="https://l3montree.com/impressum"
            >
              Imprint
            </Link>
            <Link
              className="!text-muted-foreground"
              target="_blank"
              href="https://devguard.org/terms-of-use"
            >
              Terms of Use
            </Link>
            <Link
              className="!text-muted-foreground"
              href="https://l3montree.com/datenschutz"
            >
              Privacy
            </Link>
          </div>
          Copyright © {new Date().getFullYear()} L3montree GmbH and the
          DevGuard Contributors. All rights reserved. Version{" "}
          {process.env.NEXT_PUBLIC_VERSION}
        </footer>
      </main>
    </SidebarProvider>
  );
};
export default Main;
