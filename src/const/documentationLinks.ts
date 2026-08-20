// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
export const documentationLinks = {
  docsIntroduction: "https://devguard.org/introduction",
  sbomExplaining:
    "https://docs.devguard.org/explanations/compliance/sbom-standards/",
  vexExplaining:
    "https://docs.devguard.org/explanations/vulnerability-management/what-is-vex/",
  vexRecommendationWhitepaper:
    "https://devguard.org/research-development/vex-sharing-trust-based-knowledge-based-collaborative-share-vulnerability-management-decisions-in-devguard.pdf",
  artifactExplaining:
    "https://devguard.org/explanations/core-concepts/artifacts",
  artifactVersioning:
    "https://docs.devguard.org/how-to-guides/scanning/branches-tags-and-artifacts/",
  acceptRisk:
    "https://devguard.org/explanations/vulnerability-management/vulnerability-events#4-accept-risk",
  riskCalculation:
    "https://devguard.org/explanations/vulnerability-management/risk-assessment-methodology",
  markFalsePositive:
    "https://devguard.org/explanations/vulnerability-management/vulnerability-events#2-mark-as-false-positive",
  cveDetails: (cveId: string) =>
    `https://docs.devguard.org/vulnerability-database/${cveId}/`,
  packageInspector: (purl: string) =>
    `https://docs.devguard.org/package-inspector/${encodeURIComponent(purl)}`,
};
