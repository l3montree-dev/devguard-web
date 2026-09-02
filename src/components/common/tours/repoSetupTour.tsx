// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ConditionalStep } from "@/types/view/tour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const repoSetupTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="setup-risk-scan"]',
    content: (
      <>
        The recommended way to get started: pick the scans and scanners you need
        from our curated list and let DevGuard generate a ready-to-use{" "}
        <TourLink href={`${DOCS}/how-to-guides/scanning/scan-with-gitlab-ci/`}>
          CI/CD integration
        </TourLink>
        . Every push is scanned automatically.
      </>
    ),
  },
  {
    selector: '[data-tour="setup-devguard-cli"]',
    content: (
      <>
        Prefer running things yourself? The{" "}
        <TourLink href={`${DOCS}/how-to-guides/scanning/scan-your-project/`}>
          DevGuard CLI
        </TourLink>{" "}
        runs the same scans locally or in any pipeline and uploads the results
        to this repository.
      </>
    ),
  },
  {
    selector: '[data-tour="setup-manual-upload"]',
    content: (
      <>
        Already have a SARIF or{" "}
        <TourLink href={`${DOCS}/getting-started/`}>SBOM</TourLink> file? Upload
        it manually to scan for known vulnerabilities and manage the findings —
        no pipeline required.
      </>
    ),
  },
  {
    selector: '[data-tour="setup-external-url"]',
    content: (
      <>
        Instead of uploading an SBOM, an artifact can simply reference the
        public SBOM URLs of other components. That turns this repository into a{" "}
        <strong>release asset</strong>: a product-level view that bundles the
        SBOMs of e.g. an API, a frontend, a database and an identity provider.
        Learn more at<br></br>{" "}
        <TourLink href={`${DOCS}/how-to-guides/vex/multi-level-vexing/`}>
          multi-level VEXing
        </TourLink>
        .
      </>
    ),
  },
];
