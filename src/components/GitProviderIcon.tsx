import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import React from "react";

interface Props {
  externalEntityProviderIdOrRepositoryId?: string;
}

const GitProviderIcon = ({ externalEntityProviderIdOrRepositoryId }: Props) => {
  if (
    externalEntityProviderIdOrRepositoryId === "official" ||
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
        className="h-4 w-4 scale-175 relative right-[1px]"
      />
    );
  }
  return <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />;
};

export default GitProviderIcon;
