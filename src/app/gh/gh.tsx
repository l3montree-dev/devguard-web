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
import { getApiClientFromContext } from "@/services/devGuardApi";
import { decodeObjectBase64 } from "@/services/encodeService";
import { GetServerSideProps } from "next";
import Image from "next/image";

const gh = () => {
  return (
    <div className="flex min-h-screen flex-1 flex-row items-center justify-center">
      <div className="w-96 rounded-lg border bg-secondary p-8">
        <div className="mx-auto mb-5 flex flex-row justify-center">
          <Image
            className="hidden h-20 w-auto dark:block"
            src={"/logo_inverse_horizontal.svg"}
            alt="FlawFix by l3montree Logo"
            width={300}
            height={300}
          />
          <Image
            className="h-20 w-auto dark:hidden"
            src={"/logo_horizontal.svg"}
            alt="FlawFix by l3montree Logo"
            width={300}
            height={300}
          />
        </div>
        <h1 className="mb-4 text-center text-2xl font-semibold">
          GitHub App Installation failed
        </h1>
        <p className="text-sm opacity-75">
          The GitHub-App Installation failed. This can happen due to various
          reasons. Please try again or contact our support.
        </p>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const apiClient = getApiClientFromContext(ctx);
  const state = ctx.query.state;
  const installationId = ctx.query.installation_id;

  const stateObj: { orgSlug: string; redirectTo: string } = decodeObjectBase64(
    state as string,
  );

  // quick fix for https://github.com/l3montree-dev/devguard-web/issues/53
  // retry 3 times
  let installation: Response | null = null;
  for (let i = 0; i < 3; i++) {
    installation = await apiClient(
      `/organizations/${stateObj?.orgSlug}/integrations/finish-installation?installationId=${installationId}`,
    );

    // wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (installation.ok) {
      break;
    }
  }

  if (!installation) {
    console.log("Installation failed");
    return {
      props: {
        error: "Installation failed",
      },
    };
  }

  if (!installation.ok) {
    console.log("Installation failed", installation);
    return {
      props: {
        error: "Installation failed",
      },
    };
  }

  return {
    redirect: {
      destination: stateObj.redirectTo,
      permanent: false,
    },
  };
};

export default gh;
