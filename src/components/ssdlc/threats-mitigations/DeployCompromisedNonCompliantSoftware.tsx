import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const deployCompromisedNoncompliantSoftware = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(J) Deploy compromised or noncompliant software",
    description: (
      <>
        <p>
          A compromised or noncompliant software package (or container) is
          deployed to the (production) operational environment.
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
