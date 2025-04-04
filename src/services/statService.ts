import { PolicyEvaluation, RiskDistribution } from "../types/api/api";
import { DevGuardApiClient } from "./devGuardApi";

export const fetchAssetStats = async ({
  organizationSlug,
  projectSlug,
  assetSlug,
  apiClient,
  assetVersionSlug,
}: {
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiClient: DevGuardApiClient;
  assetVersionSlug?: string;
}): Promise<{
  compliance: Array<PolicyEvaluation>;
  riskDistribution: Array<RiskDistribution>;
  cvssDistribution: Array<RiskDistribution>;
  licenses: Record<string, number>;
}> => {
  let url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug;

  if (assetVersionSlug) {
    // we should fetch the stats of a specific asset version instead of the default one.
    url += "/refs/" + assetVersionSlug;
  }

  const [compliance, riskDistribution, cvssDistribution, licenses] =
    await Promise.all([
      apiClient(url + "/compliance").then((r) => r.json()),
      apiClient(url + "/stats/risk-distribution").then((r) => r.json()),
      apiClient(url + "/stats/cvss-distribution").then((r) => r.json()),
      apiClient(url + "/components/licenses").then((r) => r.json()),
    ]);

  return {
    compliance,
    riskDistribution,
    cvssDistribution,
    licenses,
  };
};
