import { getApiClientFromContext } from "@/services/devGuardApi";
import { ArtifactDTO } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";

export async function withArtifacts(ctx: GetServerSidePropsContext) {
  // get the devGuardApiClient
  const devGuardApiClient = getApiClientFromContext(ctx);

  const organization = ctx.params?.organizationSlug;
  const projectSlug = ctx.params?.projectSlug;
  const assetSlug = ctx.params?.assetSlug;
  const assetVersionSlug = ctx.params?.assetVersionSlug;

  // get the organization
  const r = await devGuardApiClient(
    "/organizations/" +
      organization +
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
