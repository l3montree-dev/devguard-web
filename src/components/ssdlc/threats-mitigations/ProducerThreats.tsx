import { Button } from "@/components/ui/button";
import { AssetDTO, AssetMetricsDTO } from "@/types/api/api";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";

export const producerThreats = (
  router: NextRouter,
  asset: AssetDTO,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(A) Producer Threats",
    description: (
      <p>
        Producer threats are threats that originate from the developers working
        on the software. Such threats might be intentional or unintentional.
        They can be further devided into the following categories:
      </p>
    ),
    threats: [
      {
        threat: "Write insecure code",
        maxEvidence: 2,
        currentEvidence: Number(Boolean(asset.lastSastScan)),
        Message: (
          <>
            <p className="mb-2">
              <strong>Example</strong>: A developer writes code that is
              vulnerable to SQL injection
            </p>
            <p className="mt-2">
              Producing insecure code is unavoidable. Mistakes do happen and
              security issues will always be introduced into the codebase. The
              goal is to minimize the amount of insecure code that is produced.
              This can be achieved by following secure coding guidelines. Some
              issues can be found using Static Code Analysis Tools. Automatic
              tools do find <strong>up to around 50%</strong> of the issues.
              Always remember that the best tool is a human. Sometimes a
              dedicated secure code review is required.
            </p>
            <div className="mt-4 flex flex-row gap-2">
              <Link
                href={
                  router.asPath +
                  "/security-control-center?highlight=secure-coding-guidelines"
                }
              >
                <Button size={"sm"} variant={"secondary"}>
                  Download Secure-Coding Guidelines and distribute inside your
                  team
                </Button>
              </Link>
              <Link
                href={router.asPath + "/security-control-center?highlight=sast"}
              >
                <Button size={"sm"} variant={"secondary"}>
                  Enable Static Code Analysis to find vulnerabilities in your
                  code
                </Button>
              </Link>
            </div>
          </>
        ),
      },
      {
        threat: "Submit Unauthorized Change",
        maxEvidence: 1,
        currentEvidence: Number(
          Boolean(metrics.verifiedSupplyChainsPercentage > 0),
        ),
        Message: (
          <>
            <p>
              <strong>Example</strong>: Submit a change with stolen GitLab
              Credentials through the web interface or API
            </p>
            <p className="mt-2">
              Commits can be signed using the devguard command line interface
              and a private key. Actually, based on in toto principles, all of
              the file hashes are recorded. DevGuard is verifying the signatures
              inside the continuous integration pipeline and inside the
              deployment infrastructure. It matches those with keys created and
              managed by devguard.
            </p>
            <p className="mt-2">
              Use the In-Toto Provenance to mitigate this and other threats.
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
      },
      {
        threat: "Insider Threat",
        maxEvidence: 0,
        currentEvidence: 0,
        Message: (
          <>
            <p>
              <strong>Example</strong>: A developer with access to the
              repository submits a change that introduces a backdoor
            </p>
            <p className="mt-2">
              DevGuard is not able to detect insider threats. Nevertheless, it
              courages Code-Reviews and the usage of the In-Toto Provenance to
              make changes traceable.
            </p>
          </>
        ),
      },
    ],
  };
};
