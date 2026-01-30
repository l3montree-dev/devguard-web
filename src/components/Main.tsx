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
import Link from "next/link";
import React, { FunctionComponent } from "react";
import { documentationLinks } from "@/const/documentationLinks";

import { useConfig } from "../context/ConfigContext";
import EntityProviderBanner from "./common/EntityProviderBanner";

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

const Main: FunctionComponent<Props> = ({ children, fullscreen }) => {
  const dimensions = useDimensions();
  const themeConfig = useConfig();

  return (
    <main className="flex-1 font-body">
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
        <footer className="mx-auto max-w-screen-xl px-6 py-8 text-sm text-muted-foreground lg:px-8">
          <div className="mb-2 flex flex-row gap-5">
            <Link
              className="!text-muted-foreground hover:!text-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href={documentationLinks.docsIntroduction}
            >
              Documentation
            </Link>
            <Link
              className="!text-muted-foreground hover:!text-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/l3montree-dev/devguard"
            >
              GitHub
            </Link>
            <Link
              className="!text-muted-foreground hover:!text-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href={themeConfig.imprintLink}
            >
              Imprint
            </Link>
            <a
              className="!text-muted-foreground hover:!text-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href={themeConfig.termsOfUseLink}
            >
              Terms of Use
            </a>
            <a
              className="!text-muted-foreground hover:!text-foreground"
              href={themeConfig.privacyPolicyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
            <Link
              className="!text-muted-foreground hover:!text-foreground"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/l3montree-dev/devguard/blob/main/LICENSE.txt"
            >
              AGPL-3.0-License
            </Link>
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
