import { useApiQuery } from "./useApiQuery";
import useDecodedParams from "./useDecodedParams";

export const useLogs = () => {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  return useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/logs",
    {
      params: {
        path: {
          organization: organizationSlug,
          projectSlug,
          assetSlug,
        },
      },
    },
  );
};
