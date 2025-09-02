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
  const url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug;

  const urlQueryAppendixForArtifact = artifactName
    ? "?artifactName=" + encodeURIComponent(artifactName)
    : "";
  const urlAppendixForArtifact = artifactName
    ? "&artifactName=" + encodeURIComponent(artifactName)
    : "";

  const [
    componentRisk,
    riskHistoryResp,
    avgLowFixingTime,
    avgMediumFixingTime,
    avgHighFixingTime,
    avgCriticalFixingTime,
    licenses,
    events,
  ] = await Promise.all([
    apiClient(
      url + "/stats/component-risk/" + urlQueryAppendixForArtifact,
    ).then((r) => r.json()),
    apiClient(
      url +
        "/stats/risk-history/?start=" +
        extractDateOnly(last3Month) +
        "&end=" +
        extractDateOnly(new Date()) +
        urlAppendixForArtifact,
    ),
    apiClient(
      url + "/stats/average-fixing-time/?severity=low" + urlAppendixForArtifact,
    ).then((r) => r.json()),
    apiClient(
      url +
        "/stats/average-fixing-time/?severity=medium" +
        urlAppendixForArtifact,
    ).then((r) => r.json()),
    apiClient(
      url +
        "/stats/average-fixing-time/?severity=high" +
        urlAppendixForArtifact,
    ).then((r) => r.json()),
    apiClient(
      url +
        "/stats/average-fixing-time/?severity=critical" +
        urlAppendixForArtifact,
    ).then((r) => r.json()),
    apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/components/licenses/" +
        urlQueryAppendixForArtifact,
    ).then((r) => r.json() as Promise<LicenseResponse[]>),
    apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/events/?pageSize=4" +
        urlAppendixForArtifact,
    ).then((r) => r.json()),
  ]);

  // risk history is not paginated, so we can directly access the data
  const riskHistory: Array<RiskHistory> = await riskHistoryResp.json();

  console.log("Fetched asset stats:", {
    componentRisk,
    riskHistory,
    avgLowFixingTime,
    avgMediumFixingTime,
    avgHighFixingTime,
    avgCriticalFixingTime,
    licenses,
    events,
  });

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
