import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const compromisePackageRegistry = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(H) Compromise package registry",
    currentEvidence:
      Number(Boolean(metrics.verifiedSupplyChainsPercentage > 0)) +
      Number(metrics.enabledImageSigning),
    maxEvidence: 2,
    description: (
      <>
        <p>
          An adversary modifies the package on the package registry using an
          administrative interface or through a compromise of the
          infrastructure.
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
