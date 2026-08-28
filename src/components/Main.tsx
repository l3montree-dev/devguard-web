// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { HEADER_HEIGHT } from "@/const/viewConstants";
import useDimensions from "@/hooks/useDimensions";
import { classNames } from "@/utils/common";
import React, { type FunctionComponent } from "react";
import EntityProviderBanner from "./common/EntityProviderBanner";
import Footer from "./misc/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

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
  breadcrumbs?: Array<{
    title: string;
    href: string;
  }>;
}

const Main: FunctionComponent<Props> = ({
  children,
  fullscreen,
  breadcrumbs,
}) => {
  const dimensions = useDimensions();

  return (
    <main className="flex-1 font-body">
      <EntityProviderBanner />
      <div
        style={{ minHeight: dimensions.height - HEADER_HEIGHT - 100 }}
        className={classNames(
          !fullscreen && "mx-auto max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
        )}
      >
        {breadcrumbs && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index + 1 == breadcrumbs.length ? (
                      <BreadcrumbPage className="font-medium">
                        {breadcrumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="text-muted-foreground! font-medium"
                        href={breadcrumb.href}
                      >
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        {children}
      </div>
      <div className="bg-footer">
        <Footer variant="app" />
      </div>
    </main>
  );
};
export default Main;
