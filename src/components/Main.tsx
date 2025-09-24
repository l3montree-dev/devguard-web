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
import { HEADER_HEIGHT } from "@/const/viewConstants";
import useDimensions from "@/hooks/useDimensions";
import { classNames } from "@/utils/common";
import { useRouter } from "next/compat/router";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import useConfig from "../hooks/useConfig";
import { providerIdToBaseURL } from "../utils/externalProvider";
import GitProviderIcon from "./GitProviderIcon";
import UserNav from "./navigation/UserNav";
import { OrganizationDropDown } from "./OrganizationDropDown";
import { SidebarProvider } from "./ui/sidebar";
import { noStoreAvailable } from "../zustand/globalStoreProvider";

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

function isLightColor(cssVariable: string) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVariable)
    .trim();

  // Parse HSL format: "0 0% 0%" or "hsl(0, 0%, 0%)"
  const hslMatch =
    color.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/) ||
    color.match(
      /hsl\(\s*(\d+(?:\.\d+)?),?\s*(\d+(?:\.\d+)?)%,?\s*(\d+(?:\.\d+)?)%\s*\)/,
    );

  if (!hslMatch) return null;

  const lightness = parseFloat(hslMatch[3]);

  // Lightness > 50% is generally considered light
  return lightness > 50;
}

const EntityProviderImage = ({ provider }: { provider: string }) => {
  const [isLightForegroundColor, setLightForegroundColor] = useState(false);
  useEffect(() => {
    const isLight = isLightColor("--header-background");
    if (isLight !== null) {
      setLightForegroundColor(isLight);
    }
    // test again after 1 second - to catch late theme changes
    setTimeout(() => {
      const isLight = isLightColor("--header-background");
      if (isLight !== null) {
        setLightForegroundColor(isLight);
      }
    }, 1000);
  }, []);
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
        width={30}
        height={30}
        className="relative right-[1px]"
      />
    );
  }
  // check foreground color - if light, use inverse logo, else use normal logo

  if (isLightForegroundColor) {
    return (
      <Image
        src="/logo_icon.svg"
        alt="DevGuard Logo"
        width={30}
        height={30}
        className="relative right-[1px]"
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

  if (
    assetSlug &&
    activeAsset &&
    !noStoreAvailable(activeAsset) &&
    !noStoreAvailable(activeProject) &&
    activeAsset.externalEntityProviderId
  ) {
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
          {activeProject?.name} / {activeAsset.name}
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
  const dimensions = useDimensions();
  const activeOrg = useActiveOrg();
  const themeConfig = useConfig();

  return (
    <main className="flex-1 font-body">
      <header
        className={classNames(
          "relative z-20 flex min-h-[109px] items-center justify-between bg-header px-4 pt-5 sm:px-6 lg:px-8",
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
              <h1 className="font-display whitespace-nowrap text-lg font-semibold leading-7 text-header-foreground">
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
                  {(item.isActive || router?.asPath == item.href) && (
                    <div className="absolute -bottom-3 -left-2 -right-2 h-0.5 bg-primary" />
                  )}
                  <div className="mt-4 flex flex-row items-center gap-1">
                    <item.Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-header-foreground">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
                {(item.isActive || router?.asPath == item.href) && (
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
      </header>
      <EntityProviderLinkBanner />
      <div
        style={{ minHeight: dimensions.height - HEADER_HEIGHT - 100 }}
        className={classNames(
          !fullscreen && "mx-auto max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
        )}
      >
        {children}
      </div>
      <div className="bg-footer">
        <footer className="mx-auto max-w-screen-xl px-6 py-8 text-sm text-footer-foreground lg:px-8">
          <div className="mb-2 flex flex-row gap-5">
            <Link
              className="!text-footer-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/l3montree-dev/devguard"
            >
              GitHub
            </Link>
            <Link
              className="!text-footer-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href={themeConfig.imprintLink}
            >
              Imprint
            </Link>
            <a
              className="!text-footer-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href={themeConfig.termsOfUseLink}
            >
              Terms of Use
            </a>
            <a
              className="!text-footer-foreground"
              href={themeConfig.privacyPolicyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </div>
          Copyright © {new Date().getFullYear()} L3montree GmbH and the
          DevGuard Contributors. All rights reserved. Version{" "}
          {process.env.NEXT_PUBLIC_VERSION}
        </footer>
      </div>
    </main>
  );
};
export default Main;
