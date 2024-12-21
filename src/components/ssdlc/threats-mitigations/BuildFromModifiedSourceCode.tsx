import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const buildFromModifiedSource = (
  router: NextRouter,
): ThreatMitigationTopic => {
  return {
    title: "(D) Build from modified source code",
    description: (
      <>
        <p>
          <strong>Example</strong>: An attacker is able to compromise GitHub
          Actions and is able to modify the source code before the build process
          starts.
        </p>
        <p className="mt-2">
          DevGuard uses In-Toto to verify the integrity of the build process.
          In-Toto records the file hashes of the materials, like source code,
          and the produced artifacts. DevGuard verifies, that the input of the
          build equals the output of commit. Thus it is able to detect if the
          source code was modified before the build process.
        </p>
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
