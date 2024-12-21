import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const compromiseBuildProcess = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(F) Compromise build process",
    description: (
      <>
        <p>
          An adversary introduces an unauthorized change to a build output
          through tampering of the build process; or introduces false
          information into the provenance.
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
