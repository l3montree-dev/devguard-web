import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const useCompromisedPackage = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(I) Use compromised package",
    maxEvidence: 2,
    currentEvidence:
      Number(Boolean(metrics.verifiedSupplyChainsPercentage > 0)) +
      Number(metrics.enabledImageSigning),
    description: (
      <>
        <p>
          An adversary modifies the package after it has left the package
          registry, or tricks the user into using an unintended package.
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
