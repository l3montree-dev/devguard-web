// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type JobName =
  | "secret-scanning"
  | "sast"
  | "iac"
  | "sca"
  | "build"
  | "container-scanning"
  | "push"
  | "sign"
  | "attest"
  | "full"
  | "sbom-upload"
  | "sarif-upload";
