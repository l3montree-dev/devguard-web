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
        <p className="mt-2">
          <strong>Mitigations:</strong> Ensure that the package is signed and
          that the signature is verified before use.
        </p>
        <div className="mt-4 flex flex-row gap-2">
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
          <Link
            href={
              router.asPath + "/security-control-center?highlight=image-signing"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable Image Signing
            </Button>
          </Link>
          <Link
            href={
              router.asPath +
              "/security-control-center?highlight=image-verification"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable Image Verification
            </Button>
          </Link>
        </div>
      </>
    ),
  };
};
