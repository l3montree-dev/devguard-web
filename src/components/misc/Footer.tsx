// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { config } from "@/config";
import { documentationLinks } from "@/const/documentationLinks";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6 text-center text-sm text-muted-foreground sm:px-10">
      <div className="mb-2 flex flex-wrap justify-center gap-5">
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
          href={config.imprintLink}
        >
          Imprint
        </Link>
        <a
          className="!text-muted-foreground hover:!text-foreground"
          target="_blank"
          rel="noopener noreferrer"
          href={config.termsOfUseLink}
        >
          Terms of Use
        </a>
        <a
          className="!text-muted-foreground hover:!text-foreground"
          target="_blank"
          rel="noopener noreferrer"
          href={config.privacyPolicyLink}
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
      Copyright © {new Date().getFullYear()} L3montree GmbH and the DevGuard
      Contributors. All rights reserved. Version{" "}
      {process.env.NEXT_PUBLIC_VERSION}
    </footer>
  );
}
