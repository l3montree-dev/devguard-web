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
import { getLoginFlow, OryPageParams } from "@ory/nextjs/app";
import oryConfig from "../../ory.config";
import ThreeJSFeatureScreen from "../../components/threejs/ThreeJSFeatureScreen";
import { oryComponentOverrides } from "../../components/ory/overrides";
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
      <div className="flex min-h-screen flex-1 flex-row">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-8 xl:px-24">
            <div className="mb-10">
              <Image
                className="hidden h-14 w-auto dark:block"
                src={"/logo_inverse_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-16 w-auto dark:hidden"
                src={"/logo_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="mt-10 text-left text-2xl font-bold leading-9 tracking-tight">
                Sign in to your Account
              </h2>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                Don&quot;t have an Account?{" "}
                <Link
                  data-testid="cta-link"
                  href="/registration"
                  className="font-semibold hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
            <Login
              config={oryConfig}
              flow={flow}
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

export default LoginPage;
