// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type z from "zod";

export type Modify<T, U> = Omit<T, keyof U> & U;

export type ZodConvert<T> = {
  [P in keyof T]: T[P] extends string
    ? z.ZodString
    : T[P] extends number
      ? z.ZodNumber
      : T[P] extends boolean
        ? z.ZodBoolean
        : T[P] extends Array<infer U>
          ? // @ts-expect-error
            z.ZodArray<ZodConvert<U>>
          : T[P] extends object
            ? z.ZodObject<ZodConvert<T[P]>>
            : never;
};

export type ExternalTicketProvider = "github" | "gitlab" | "jira" | "opencode";

export type GitInstances = "GitHub" | "Gitlab";

export interface Config {
  "secret-scanning": boolean;
  sast: boolean;
  iac: boolean;

  sca: boolean;

  "container-scanning": boolean;
  build: boolean;
  push: boolean;

  sign: boolean;
  attest: boolean;

  sbom: boolean;
  sarif: boolean;
}
