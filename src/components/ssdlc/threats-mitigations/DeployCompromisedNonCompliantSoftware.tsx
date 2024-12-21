import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const deployCompromisedNoncompliantSoftware = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(J) Deploy compromised or noncompliant software",
    currentEvidence: 0,
    maxEvidence: 0,
    description: (
      <>
        <p>
          A compromised or noncompliant software package (or container) is
          deployed to the (production) operational environment.
        </p>
      </>
    ),
  };
};
