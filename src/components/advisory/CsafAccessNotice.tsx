// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";
import { classNames } from "@/utils/common";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";

export const useCsafAccess = () => {
  const asset = useActiveAsset();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams();

  return {
    sharesInformation: asset?.sharesInformation ?? false,
    settingsHref: `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/settings#vulnerability-management`,
  };
};

const CsafAccessNotice: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const { sharesInformation, settingsHref } = useCsafAccess();
  if (sharesInformation) return null;

  return (
    <p
      className={classNames(
        "flex items-start gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        This repository does not expose its vulnerability data publicly, so its
        CSAF documents cannot be accessed. Turn on &ldquo;Enable public access
        to vulnerability data&rdquo; in the{" "}
        <Link href={settingsHref} className="text-link">
          repository settings
        </Link>
        .
      </span>
    </p>
  );
};

export default CsafAccessNotice;
