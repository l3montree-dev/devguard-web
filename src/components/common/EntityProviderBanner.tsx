"use client";
import Link from "next/link";
import { useActiveAsset } from "../../hooks/useActiveAsset";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { useActiveProject } from "../../hooks/useActiveProject";
import useDecodedParams from "../../hooks/useDecodedParams";
import { providerIdToBaseURL } from "../../utils/externalProvider";
import { noStoreAvailable } from "../../zustand/globalStoreProvider";
import GitProviderIcon from "../GitProviderIcon";

const slugToProvider = (slug: string | undefined) => {
  return slug?.replace("@", "");
};

const EntityProviderBanner = () => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const activeAsset = useActiveAsset();

  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  if (!activeOrg && !activeProject && !activeAsset) {
    return null;
  }

  if (
    assetSlug &&
    activeAsset &&
    !noStoreAvailable(activeAsset) &&
    !noStoreAvailable(activeProject) &&
    activeAsset.externalEntityProviderId
  ) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={
            providerIdToBaseURL(activeAsset.externalEntityProviderId) +
            `/-/p/` +
            activeAsset.externalEntityId
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {activeProject?.name} / {activeAsset.name}
        </Link>
      </div>
    );
  }

  if (projectSlug && activeProject && activeProject.externalEntityProviderId) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={
            providerIdToBaseURL(activeOrg.externalEntityProviderId) +
            `/-/g/` +
            activeProject.externalEntityId
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {activeProject.name}
        </Link>
      </div>
    );
  }

  if (organizationSlug?.startsWith("@")) {
    return (
      <div>
        <Link
          className="flex !text-secondary-foreground items-center justify-center gap-2 bg-secondary px-4 py-1 text-xs transition-all hover:underline text-white hover:bg-accent"
          href={providerIdToBaseURL(organizationSlug?.replace("@", ""))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitProviderIcon
            externalEntityProviderIdOrRepositoryId={slugToProvider(
              organizationSlug,
            )}
          />
          {organizationSlug?.replace("@", "")}
        </Link>
      </div>
    );
  }

  return <div></div>;
};

export default EntityProviderBanner;
