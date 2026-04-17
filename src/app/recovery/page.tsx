// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Head from "next/head";
import { Recovery } from "@ory/elements-react/theme";
import { getRecoveryFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import Image from "next/image";
import { Card, CardContent } from "../../components/ui/card";
import oryConfig from "../../ory.config";
import { oryComponentOverrides } from "../../components/ory/overrides";
import ContainerYardScene from "../../components/threejs/ContainerYardScene";
import Footer from "@/components/misc/Footer";
import FourSideGridPattern from "@/components/misc/FourSideGridPattern";

const RecoveryPage = async (props: OryPageParams) => {
  const flow = await getRecoveryFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Recover your account</title>
      </Head>
      <div className="relative flex min-h-screen flex-col bg-background">
        <FourSideGridPattern />
        <div className="flex flex-1 items-center justify-center flex-col pt-6">
          <div className="w-full max-w-6xl">
            <Card className="overflow-hidden p-0">
              <CardContent className="grid p-0 md:grid-cols-5">
                {/* Left: recovery form */}
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

                  <Recovery
                    flow={flow}
                    config={oryConfig}
                    components={oryComponentOverrides}
                  />
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
        <div className="pb-14">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default RecoveryPage;
