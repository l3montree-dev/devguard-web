// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Head from "next/head";
import Image from "next/image";

import { Login } from "@ory/elements-react/theme";
import { getLoginFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import oryConfig from "../../ory.config";
import ContainerYardScene from "../../components/threejs/ContainerYardScene";
import { loginComponentOverrides } from "../../components/ory/overrides";
import { Card, CardContent } from "../../components/ui/card";
import PrivacyPolicyLink from "../../components/PrivacyPolicyLink";
import TermsOfUseLink from "../../components/TermsOfUseLink";
import Footer from "@/components/misc/Footer";
import FourSideGridPattern from "@/components/misc/FourSideGridPattern";

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
      <div className="relative flex min-h-screen flex-col bg-background">
        <FourSideGridPattern />
        <div className="flex min-h-screen items-center justify-center flex-col pt-6">
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
          <div className="mt-14">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
