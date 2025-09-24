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
import Link from "next/link";
import React, { FunctionComponent } from "react";
import { useActiveOrg } from "../hooks/useActiveOrg";

import { useConfig } from "../context/ConfigContext";
import { OrganizationDropDown } from "./OrganizationDropDown";
import EntityProviderBanner from "./common/EntityProviderBanner";
import EntityProviderImage from "./common/EntityProviderImage";
import UserNav from "./navigation/UserNav";

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

const Main: FunctionComponent<Props> = ({
  title,
  Title,
  children,
  Menu,
  fullscreen,
}) => {
  const router = useRouter();
  const dimensions = useDimensions();
  const themeConfig = useConfig();
  const activeOrg = useActiveOrg();

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
      </header>
      <EntityProviderBanner />
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
