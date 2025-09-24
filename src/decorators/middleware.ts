// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { config } from "@/config";
import { addToInitialZustand as addToInitialZustand } from "@/zustand/initialState";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetServerSideProps,
} from "next";
import withConfig from "./withConfig";

type Extract<
  T extends ReadonlyArray<(ctx: GetServerSidePropsContext) => Promise<any>>,
> = {
  [Index in keyof T]: T[Index] extends (
    ctx: GetServerSidePropsContext,
  ) => Promise<infer V>
    ? V
    : never;
};

export type DecoratedGetServerSideProps<AdditionalData, Props = {}> = (
  ctx: GetServerSidePropsContext,
  additionalData: AdditionalData & { config: typeof config },
) => GetServerSidePropsResult<Props> | Promise<GetServerSidePropsResult<Props>>;

export const DEFAULT_DECORATORS = {
  config: withConfig,
};

export const middleware = <Additional extends Record<string, any>>(
  handler: DecoratedGetServerSideProps<Additional, any>,
  decorators: {
    [K in keyof Additional]: (
      ctx: GetServerSidePropsContext,
    ) => Promise<Additional[K]>;
  },
): GetServerSideProps => {
  return async (ctx: GetServerSidePropsContext) => {
    try {
      // @ts-ignore
      const returns = await Promise.all(
        Object.values({ ...decorators, ...DEFAULT_DECORATORS }).map((fn) =>
          fn(ctx),
        ),
      );
      const params = Object.fromEntries(
        Object.keys({ ...decorators, ...DEFAULT_DECORATORS }).map((key, i) => [
          key,
          returns[i],
        ]),
      );

      const resp = await handler(ctx, params as any);
      addToInitialZustand(resp, { ...(params as any) });
      return resp;
    } catch (e) {
      // if a middleware function throws an error,
      // we will do whatever it told us todo
      if (e instanceof HttpError) {
        return e.instructions;
      }
      throw e;
    }
  };
};

export class HttpError extends Error {
  instructions: GetServerSidePropsResult<never>;
  constructor(instructions: GetServerSidePropsResult<never>) {
    super("HTTP Error");
    this.instructions = instructions;
  }
}
