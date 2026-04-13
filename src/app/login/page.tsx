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

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Login } from "@ory/elements-react/theme";
import { getLoginFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import oryConfig from "../../ory.config";
import { config } from "../../config";
import ContainerYardScene from "../../components/threejs/ContainerYardScene";
import { loginComponentOverrides } from "../../components/ory/overrides";
import { Card, CardContent } from "../../components/ui/card";
import PrivacyPolicyLink from "../../components/PrivacyPolicyLink";
import TermsOfUseLink from "../../components/TermsOfUseLink";

const LoginPage = async (props: OryPageParams) => {
  const flow = await getLoginFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <>
      <Head>
        <title>DevGuard - Sign in</title>
        <meta name="description" content="DevGuard Sign in" />
      </Head>
      <div className="relative min-h-screen bg-background">
        {/* Top edge grid pattern */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-8 border-t border-b border-t-(--grid-line-color) border-b-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px]" />
        {/* Bottom edge grid pattern */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-8 border-t border-b border-t-(--grid-line-color) border-b-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px]" />
        {/* Left edge grid pattern */}
        <div className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden w-8 border-r border-r-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
        {/* Right edge grid pattern */}
        <div className="pointer-events-none fixed inset-y-0 right-0 z-50 hidden w-8 border-l border-l-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />

        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <Card className="overflow-hidden p-0">
              <CardContent className="grid p-0 md:grid-cols-5">
                {/* Left: login form */}
                <div className="flex flex-col justify-center p-8 col-span-2">
                  <div className="mb-6 flex justify-center">
                    <Image
                      className="hidden h-16 w-auto dark:block"
                      src={"/logo_inverse_horizontal.svg"}
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                    <Image
                      className="h-10 w-auto dark:hidden"
                      src={"/logo_horizontal.svg"}
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                  </div>

                  <Login
                    config={oryConfig}
                    flow={flow}
                    components={loginComponentOverrides}
                  />

                  <p className="mt-6 text-center text-xs text-muted-foreground">
                    By using DevGuard you agree to our <TermsOfUseLink /> and{" "}
                    <PrivacyPolicyLink />.
                  </p>
                </div>

                {/* Right: container yard scene */}
                <div
                  className="col-span-3 relative hidden border-l md:block"
                  style={{ background: "hsl(var(--harbor-background))" }}
                >
                  <ContainerYardScene />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
