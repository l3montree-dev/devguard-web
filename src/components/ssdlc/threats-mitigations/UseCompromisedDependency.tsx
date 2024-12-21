import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const useCompromisedDependency = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(E) Use compromised dependency",
    description: (
      <p>
        A dependency threat is a vector for an adversary to introduce behavior
        to an artifact through external software that the artifact requires to
        function.
      </p>
    ),
    threats: [
      {
        threat: "Use a dependency with known vulnerabilities",
        maxEvidence: 2,
        currentEvidence: Number(Boolean(metrics.enabledSCA)),
        Message: (
          <>
            <p className="mb-2">
              Acording to the Linux Foundation a typical software project is
              made up of 80-90% open source components. These components can
              contain known vulnerabilities that can be exploited by an
              adversary. DevGuard can help you to identify and manage these
              vulnerabilities.
            </p>
            <p className="mt-2">
              <strong>Mitigations:</strong> You should create secure-coding
              guidelines and distribute them inside your team. This guidelines
              should include how to handle dependencies and how to keep them
              up-to-date. You should also enable Software Composition Analysis
              (SCA) to find known vulnerabilities in your dependencies and to
              manage them with DevGuard.
            </p>
            <p className="mt-2">
              <strong>Guide:</strong> You can find more information about how to
              handel findings of Software Composition Analysis in the{" "}
              <Link
                href="https://devguard.org/guides/software-composition-analysis"
                target="_blank"
                rel="noopener noreferrer"
              >
                DevGuard Docs
              </Link>
            </p>
            <div className="mt-4 flex flex-row gap-2">
              <Link
                href={
                  router.asPath +
                  "/security-control-center?highlight=secure-coding-guidelines"
                }
              >
                <Button size={"sm"} variant={"secondary"}>
                  Create Secure-Coding Guidelines and distribute inside your
                  team
                </Button>
              </Link>
              <Link
                href={router.asPath + "/security-control-center?highlight=sca"}
              >
                <Button size={"sm"} variant={"secondary"}>
                  Enable Software Composition Analysis (SCA)
                </Button>
              </Link>
            </div>
          </>
        ),
      },
      {
        threat: "Use a container image with known vulnerabilities",
        maxEvidence: 2,
        currentEvidence: Number(Boolean(metrics.enabledContainerScanning)),
        Message: (
          <>
            <p className="mb-2">
              A container image is a lightweight, stand-alone, executable
              package that includes everything needed to run a piece of
              software, including the code, a runtime, libraries, environment
              variables, and config files. A container image can contain known
              vulnerabilities that can be exploited by an adversary. DevGuard
              can help you to identify and manage these vulnerabilities.
            </p>
            <p className="mt-2">
              <strong>Mitigations:</strong> You should create secure-coding
              guidelines and distribute them inside your team. This guidelines
              should include how to handle your base images and how to keep them
              up-to-date. You should also enable Container Scanning to find
              known vulnerabilities in your container images and to manage them
              with DevGuard.
            </p>
            <p className="mt-2">
              <strong>Guide:</strong> You can find more information about how to
              handel findings of Container Scanning in the{" "}
              <Link
                href="https://devguard.org/guides/container-scanning"
                target="_blank"
                rel="noopener noreferrer"
              >
                DevGuard Docs
              </Link>
            </p>
            <div className="mt-4 flex flex-row gap-2">
              <Link
                href={
                  router.asPath +
                  "/security-control-center?highlight=secure-coding-guidelines"
                }
              >
                <Button size={"sm"} variant={"secondary"}>
                  Create Secure-Coding Guidelines and distribute inside your
                  team
                </Button>
              </Link>
              <Link
                href={
                  router.asPath +
                  "/security-control-center?highlight=container-scanning"
                }
              >
                <Button size={"sm"} variant={"secondary"}>
                  Enable Container Scanning
                </Button>
              </Link>
            </div>
          </>
        ),
      },
    ],
  };
};
