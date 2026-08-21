// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React from "react";
import Image from "next/image";
import { classNames, getEcosystem } from "@/utils/common";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Package } from "lucide-react";

const invertSvgOnDark = (ecosystem: string) =>
  ["apk", "bitnami", "cargo"].includes(ecosystem);

const EcosystemImage = ({
  packageName,
  size,
}: {
  packageName: string;
  size?: number;
}) => {
  if (
    [
      "golang",
      "npm",
      "apk",
      "pypi",
      "maven",
      "cargo",
      "crates.io",
      "Packagist",
      "RubyGems",
      "deb",
      "bitnami",
      "NuGet",
      "nix",
      "php",
      "composer",
    ].includes(getEcosystem(packageName))
  ) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Image
              alt={"Logo von " + getEcosystem(packageName)}
              width={size ?? 20}
              height={size ?? 20}
              className={classNames(
                "inline-block",
                invertSvgOnDark(getEcosystem(packageName)) ? "dark:invert" : "",
              )}
              src={
                "/logos/" +
                getEcosystem(packageName).toLowerCase() +
                "-svgrepo-com.svg"
              }
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{getEcosystem(packageName)}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className="block text-muted-foreground">
      <Package width={size ?? 20} height={size ?? 20} />
    </span>
  );
};

export default EcosystemImage;
