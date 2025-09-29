import { ArtifactDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../../services/devGuardApiAppRouter";

export async function withArtifacts(
  organizationSlug: string,
  projectSlug: string,
  assetSlug: string,
  assetVersionSlug: string,
) {
  // get the devGuardApiClient
  const devGuardApiClient = await getApiClientInAppRouter();

  // get the organization
  const r = await devGuardApiClient(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/artifacts",
  );

  if (!r.ok) {
    return [];
  }

  // parse the organization
  const artifacts: ArtifactDTO[] = await r.json();
  return artifacts;
}
