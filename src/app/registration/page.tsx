// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Head from "next/head";
import Image from "next/image";
import { Registration } from "@ory/elements-react/theme";
import { getRegistrationFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import { oryComponentOverrides } from "../../components/ory/overrides";
import oryConfig from "../../ory.config";
import TermsOfUseLink from "../../components/TermsOfUseLink";
import PrivacyPolicyLink from "../../components/PrivacyPolicyLink";
import { rewriteFlow } from "../../types/auth";
import { config } from "../../config";
import { redirect } from "next/navigation";
import { Card, CardContent } from "../../components/ui/card";
import ContainerYardScene from "../../components/threejs/ContainerYardScene";
import Footer from "@/components/misc/Footer";
import FourSideGridPattern from "@/components/misc/FourSideGridPattern";

// Renders the registration page
const RegistrationPage = async (props: OryPageParams) => {
  if (!config.registrationEnabled) {
    redirect("/login");
  }

  const flow = await getRegistrationFlow(oryConfig, props.searchParams);
  if (!flow) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Create your DevGuard account</title>
        <meta name="description" content="Create your DevGuard account" />
      </Head>
      <div className="relative flex min-h-screen flex-col bg-background">
        <FourSideGridPattern />
        <div className="flex min-h-screen items-center justify-center flex-col pt-8">
          <div className="w-full max-w-6xl">
            <Card className="overflow-hidden p-0">
              <CardContent className="grid p-0 md:grid-cols-5">
                {/* Left: registration form */}
                <div className="flex flex-col justify-center p-8 col-span-2">
                  <div className="mb-6 flex justify-center">
                    <Image
                      className="hidden h-16 w-auto dark:block"
                      src="/logo_inverse_horizontal.svg"
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                    <Image
                      className="h-10 w-auto dark:hidden"
                      src="/logo_horizontal.svg"
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                  </div>

                  <Registration
                    flow={rewriteFlow(flow)}
                    config={oryConfig}
                    components={oryComponentOverrides}
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

export default RegistrationPage;
