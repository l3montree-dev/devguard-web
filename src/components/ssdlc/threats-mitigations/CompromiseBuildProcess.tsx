import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const compromiseBuildProcess = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(F) Compromise build process",
    maxEvidence: 0,
    currentEvidence: 0,
    description: (
      <>
        <p>
          An adversary introduces an unauthorized change to a build output
          through tampering of the build process; or introduces false
          information into the provenance. SLSA Level 3 can mitigate this
          threat. Currently we do not support SLSA Level 3.
        </p>
      </>
    ),
  };
};
