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
import ThreeJSFeatureScreen from "../../components/threejs/ThreeJSFeatureScreen";

import { Registration } from "@ory/elements-react/theme";
import { getRegistrationFlow, OryPageParams } from "@ory/nextjs/app";
import { oryComponentOverrides } from "../../components/ory/overrides";
import oryConfig from "../../ory.config";
import TermsOfUseLink from "../../components/TermsOfUseLink";
import PrivacyPolicyLink from "../../components/PrivacyPolicyLink";
import { rewriteFlow } from "../../types/auth";
import { config } from "../../config";
import { redirect } from "next/navigation";

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
      <div className="flex min-h-screen flex-1  flex-row bg-white ">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-8 xl:px-24">
            <div className="mb-10">
              <Image
                className="hidden h-20 w-auto dark:block"
                src="/logo_inverse_horizontal.svg"
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-20 w-auto dark:hidden"
                src="/logo_horizontal.svg"
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="mt-10 text-left text-2xl font-bold leading-9 tracking-tight">
                Create your DevGuard account
              </h2>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                Already have an Account?{" "}
                <Link
                  data-testid="cta-link"
                  href="/login"
                  className="font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <Registration
              flow={rewriteFlow(flow)}
              config={oryConfig}
              components={oryComponentOverrides}
            />
            <div className="mt-12 flex flex-col items-center">
              <p className="text-sm/6 text-muted-foreground text-center max-w-sm">
                By using DevGuard you agree to our <TermsOfUseLink /> and{" "}
                <PrivacyPolicyLink />.
              </p>
            </div>
          </div>
        </div>
        <ThreeJSFeatureScreen />
      </div>
    </>
  );
};

export default RegistrationPage;
