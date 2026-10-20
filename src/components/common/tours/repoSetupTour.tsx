// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ConditionalStep } from "@/types/view/tour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const repoSetupTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="onboarding-steps"]',
    content: (
      <>
        The recommended way to get started: follow these steps to add the
        DevGuard{" "}
        <TourLink href={`${DOCS}/how-to-guides/scanning/scan-with-gitlab-ci/`}>
          CI/CD integration
        </TourLink>{" "}
        to your pipeline. Every push is scanned automatically.
      </>
    ),
  },
  {
    selector: '[data-tour="onboarding-upload"]',
    content: (
      <>
        Already have a SARIF, VEX or{" "}
        <TourLink href={`${DOCS}/getting-started/`}>SBOM</TourLink> file? Drop
        it here to scan for known vulnerabilities and manage the findings — no
        pipeline required.
      </>
    ),
  },
  {
    selector: '[data-tour="onboarding-alternatives"]',
    content: (
      <>
        Using another CI system or want to bundle the SBOMs of several
        components into a <strong>release asset</strong>? These guides show
        alternative setups, like the{" "}
        <TourLink href={`${DOCS}/how-to-guides/scanning/scan-your-project/`}>
          DevGuard CLI
        </TourLink>{" "}
        or{" "}
        <TourLink href={`${DOCS}/how-to-guides/vex/multi-level-vexing/`}>
          multi-level VEXing
        </TourLink>
        .
      </>
    ),
  },
];
