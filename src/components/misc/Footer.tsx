// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { documentationLinks } from "@/const/documentationLinks";
import { useConfig } from "@/context/ConfigContext";
import { useInstanceInfo } from "@/hooks/useInstanceSettings";
import { classNames } from "@/utils/common";
import Link from "next/link";

const linkClassName = "!text-muted-foreground hover:!text-foreground";

interface Props {
  // "app" is the container-width footer of the app shell, "auth" the centered one on the login/registration pages
  variant?: "app" | "auth";
}

export default function Footer({ variant = "auth" }: Props) {
  const config = useConfig();
  const instanceInfo = useInstanceInfo();
  const isApp = variant === "app";

  return (
    <footer
      id="misc-footer"
      className={classNames(
        "text-muted-foreground",
        isApp
          ? "mx-auto max-w-screen-xl px-6 py-8 text-sm lg:px-8"
          : "px-4 text-center text-xs sm:px-10 sm:text-sm",
      )}
    >
      <div
        className={classNames(
          "mb-2 flex",
          isApp
            ? "flex-row gap-5"
            : "flex-wrap justify-center gap-x-4 gap-y-1 sm:gap-5",
        )}
      >
        <Link
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href={documentationLinks.docsIntroduction}
        >
          Documentation
        </Link>
        <Link
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/l3montree-dev/devguard"
        >
          GitHub
        </Link>
        <Link
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href={config.imprintLink}
        >
          Imprint
        </Link>
        <a
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href={config.termsOfUseLink}
        >
          Terms of Use
        </a>
        <a
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href={config.privacyPolicyLink}
        >
          Privacy
        </a>
        <Link
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/l3montree-dev/devguard/blob/main/LICENSE.txt"
        >
          AGPL-3.0-License
        </Link>
      </div>
      <div className={isApp ? "flex gap-1" : ""}>
        <p className={"text-balance mb-2"}>
          Copyright © {process.env.NEXT_PUBLIC_BUILD_YEAR} L3montree GmbH and
          the DevGuard Contributors. All rights reserved.
        </p>
        <p className={"text-balance sm:inline"}>
          Web-Version: {process.env.NEXT_PUBLIC_VERSION ?? "dev"}
          {instanceInfo?.apiVersion &&
            ` · API-Version ${instanceInfo.apiVersion}`}
        </p>
      </div>
    </footer>
  );
}
