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
