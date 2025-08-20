import { GetServerSidePropsContext } from "next";
import {
  AverageFixingTime,
  ComponentRisk,
  LicenseResponse,
  Paged,
  PolicyEvaluation,
  RiskDistribution,
  VulnEventDTO,
} from "../types/api/api";
import { DevGuardApiClient } from "./devGuardApi";

export const fetchAssetStats = async ({
  organizationSlug,
  projectSlug,
  assetSlug,
  apiClient,
  assetVersionSlug,
  context,
}: {
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiClient: DevGuardApiClient;
  assetVersionSlug?: string;
  context: GetServerSidePropsContext;
}): Promise<{
  compliance: Array<PolicyEvaluation>;
  componentRisk: ComponentRisk;
  riskHistory: Array<RiskDistribution>;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
  licenses: Array<LicenseResponse>;
  events: Paged<VulnEventDTO>;
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

  const [
    compliance,
    componentRisk,
    riskHistoryResp,
    avgLowFixingTime,
    avgMediumFixingTime,
    avgHighFixingTime,
    avgCriticalFixingTime,
    licenses,
    events,
  ] = await Promise.all([
    apiClient(url + "/compliance").then((r) => r.json()),
    apiClient(url + "/stats/component-risk").then((r) => r.json()),
    apiClient(
      url +
        "/stats/risk-history?start=" +
        extractDateOnly(last3Month) +
        "&end=" +
        extractDateOnly(new Date()),
    ),
    apiClient(url + "/stats/average-fixing-time?severity=low").then((r) =>
      r.json(),
    ),
    apiClient(url + "/stats/average-fixing-time?severity=medium").then((r) =>
      r.json(),
    ),
    apiClient(url + "/stats/average-fixing-time?severity=high").then((r) =>
      r.json(),
    ),
    apiClient(url + "/stats/average-fixing-time?severity=critical").then((r) =>
      r.json(),
    ),
    apiClient(url + "/components/licenses").then(
      (r) => r.json() as Promise<LicenseResponse[]>,
    ),
    apiClient(url + "/events/?pageSize=3").then((r) => r.json()),
  ]);

  // sort the licenses by count
  licenses.sort((a, b) => b.count - a.count);

  // risk history is not paginated, so we can directly access the data
  const riskHistory: Array<RiskDistribution> = await riskHistoryResp.json();

  return {
    compliance,
    componentRisk,
    riskHistory,
    avgLowFixingTime,
    avgMediumFixingTime,
    avgHighFixingTime,
    avgCriticalFixingTime,
    licenses,
    events,
  };
};

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];
const last3Month = new Date();
last3Month.setMonth(last3Month.getMonth() - 3);
