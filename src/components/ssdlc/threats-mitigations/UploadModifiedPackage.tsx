import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const uploadModifiedPackage = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(G) Upload modified package",
    description: (
      <>
        <p>
          An adversary uploads a package not built from the proper build
          process.
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
