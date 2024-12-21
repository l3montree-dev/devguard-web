import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const useCompromisedDependency = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(E) Use compromised dependency",
    description: (
      <>
        <p>
          A dependency threat is a vector for an adversary to introduce behavior
          to an artifact through external software that the artifact requires to
          function.
        </p>
        <p className="mt-2"></p>
        <div className="mt-4">
          <Link href={router.asPath + "/security-control-center?highlight=sca"}>
            <Button size={"sm"} variant={"secondary"}>
              Enable Software Composition Analysis (SCA)
            </Button>
          </Link>
        </div>
      </>
    ),
  };
};
