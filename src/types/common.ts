// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
import z from "zod";

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

export const ExternalTicketProviderNames: {
  [key in ExternalTicketProvider]: string;
} = {
  github: "GitHub",
  gitlab: "GitLab",
  jira: "Jira",
  opencode: "openCode",
};

export type GitInstances = "GitHub" | "Gitlab";

export const GitInstances: {
  [key in GitInstances]: string;
} = {
  GitHub: "github",
  Gitlab: "gitlab",
};

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
