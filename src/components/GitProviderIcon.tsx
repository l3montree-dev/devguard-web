// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import React from "react";

interface Props {
  externalEntityProviderIdOrRepositoryId?: string;
}

const GitProviderIcon = ({ externalEntityProviderIdOrRepositoryId }: Props) => {
  if (
    externalEntityProviderIdOrRepositoryId === "gitlab" ||
    externalEntityProviderIdOrRepositoryId?.startsWith("gitlab:")
  ) {
    return (
      <img
        src="/assets/gitlab.svg"
        alt="OpenCode Logo"
        className="h-4 w-4  relative top-[1px]"
      />
    );
  } else if (externalEntityProviderIdOrRepositoryId === "opencode") {
    return (
      <img
        src="/logos/opencode.svg"
        alt="OpenCode Logo"
        className="h-4 w-4 relative right-[1px]"
      />
    );
  }
  return <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />;
};

export default GitProviderIcon;
