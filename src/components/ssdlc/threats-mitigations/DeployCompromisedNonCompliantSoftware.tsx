import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
