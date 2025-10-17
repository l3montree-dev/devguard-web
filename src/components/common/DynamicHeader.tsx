// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { classNames } from "@/utils/common";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import useDecodedParams from "../../hooks/useDecodedParams";
import UserNav from "../navigation/UserNav";
import { OrganizationDropDown } from "../OrganizationDropDown";
import EntityProviderImage from "./EntityProviderImage";

interface Props {
  Title: ReactNode;
  menu: Array<{
    title: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
  }> | null;
  z: number;
}
export default function DynamicHeader({ Title, menu, z }: Props) {
  const activeOrg = useActiveOrg();
  const pathname = usePathname();
  const params = useDecodedParams();

  const slug = params.organizationSlug || activeOrg?.slug || "";
  return (
    <header
      style={{ zIndex: 20 + z }}
      className={classNames(
        "absolute top-0 left-0 right-0 z-20 flex min-h-[109px] items-center justify-between bg-header px-4 pt-5 sm:px-6 lg:px-8",
        Boolean(menu) ? "pb-3" : "pb-5",
      )}
    >
      <div className="mx-auto w-full max-w-screen-2xl">
        <div className="flex flex-row items-center gap-4">
          <Link href={`/${slug}`}>
            <EntityProviderImage provider={slug} />
          </Link>
          <div>
            <OrganizationDropDown />
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <h1 className="font-display whitespace-nowrap text-lg font-semibold leading-7 text-header-foreground">
              {Title}
            </h1>
            <UserNav />
          </div>
        </div>
        {menu && (
          <div className="flex flex-row items-end gap-6 text-sm">
            {menu.map((item) => (
              <Link
                className={classNames(
                  "cursor:pointer relative hover:no-underline",
                )}
                key={item.title}
                href={item.href}
              >
                {(item.isActive || pathname == item.href) && (
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
  );
}
