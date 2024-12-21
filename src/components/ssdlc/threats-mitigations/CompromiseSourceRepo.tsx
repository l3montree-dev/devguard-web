import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const compromiseSourceRepo = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(C) Compromise source repository",
    currentEvidence: Number(
      Boolean(metrics.verifiedSupplyChainsPercentage > 0),
    ),
    maxEvidence: 1,
    description: (
      <>
        <p>
          <strong>Example</strong>: An adversary introduces a change to the
          source control repository, like GitLab, through an administrative
          interface, or through a compromise of the underlying infrastructure.
        </p>
        <p className="mt-2"></p>
        <div className="mt-4">
          <Link
            href={
              router.asPath +
              "/security-control-center?highlight=in-toto-provenance"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable In-Toto Provenance
            </Button>
          </Link>
        </div>
      </>
    ),
  };
};
