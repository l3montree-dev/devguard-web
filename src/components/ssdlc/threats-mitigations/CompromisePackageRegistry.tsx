import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const compromisePackageRegistry = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(H) Compromise package registry",
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
