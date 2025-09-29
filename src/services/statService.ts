import { GetServerSidePropsContext } from "next";
import {
  AverageFixingTime,
  ComponentRisk,
  LicenseResponse,
  Paged,
  PolicyEvaluation,
  RiskDistribution,
  RiskHistory,
  VulnEventDTO,
} from "../types/api/api";
import { DevGuardApiClient } from "./devGuardApi";

export const fetchAssetStats = async ({
  organizationSlug,
  projectSlug,
  assetSlug,
  apiClient,
  assetVersionSlug,
  artifactName,
}: {
  artifactName: string | undefined;
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiClient: DevGuardApiClient;
  assetVersionSlug: string;
  context: GetServerSidePropsContext;
}): Promise<{
  componentRisk: ComponentRisk;
  riskHistory: Array<RiskHistory>;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
  licenses: Array<LicenseResponse>;
  events: Paged<VulnEventDTO>;
}> => {
  // risk history is not paginated, so we can directly access the data
  const riskHistory: Array<RiskHistory> = await riskHistoryResp.json();

  return {
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
