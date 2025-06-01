import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import React from "react";

interface Props {
  slug: string;
}

const getProviderIdFromSlug = (slug: string) => {
  const parts = slug.split("@");
  if (parts.length > 1) {
    return parts[1];
  }
  return null;
};

const GitProviderIcon = (props: Props) => {
  if (props.slug === "@official") {
    return (
      <img
        src="/assets/gitlab.svg"
        alt="OpenCode Logo"
        className="h-4 w-4  relative top-[1px]"
      />
    );
  } else if (props.slug === "@opencode") {
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
