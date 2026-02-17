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
import Link from "next/link";

import ThreeJSFeatureScreen from "@/components/threejs/ThreeJSFeatureScreen";
import { Recovery } from "@ory/elements-react/theme";
import { getRecoveryFlow, OryPageParams } from "@ory/nextjs/app";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../../components/ui/card";
import oryConfig from "../../ory.config";
import { oryComponentOverrides } from "../../components/ory/overrides";

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
      <div className="flex min-h-screen flex-1 flex-row">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-8 xl:px-24">
            <div>
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
              <div className="mt-10">
                <Recovery
                  flow={flow}
                  config={oryConfig}
                  components={oryComponentOverrides}
                />
              </div>
            </div>
          </div>
        </div>
        <ThreeJSFeatureScreen />
      </div>
    </>
  );
};

export default RecoveryPage;
