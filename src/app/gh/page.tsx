// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

/* eslint-disable local/require-loading-boundary -- client page with no server
   await; it renders its own "finishing installation" state while the GitHub
   callback runs, so a route-level skeleton would never show. */

"use client";

import { finishIntegrationInstallation } from "@/services/organizationService";
import { decodeObjectBase64 } from "@/services/encodeService";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import Callout from "../../components/common/Callout";

const Gh = () => {
  const router = useRouter();
  const [err, setErr] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const running = useRef(false);
  useEffect(() => {
    async function finishInstallation() {
      if (running.current) return;
      running.current = true;

      const state = searchParams?.get("state");
      const installationId = searchParams?.get("installation_id");

      const stateObj: { orgSlug: string; redirectTo: string } =
        decodeObjectBase64(state as string);

      // quick fix for https://github.com/l3montree-dev/devguard-web/issues/53
      // retry 3 times
      let installed = false;
      for (let i = 0; i < 3; i++) {
        try {
          await finishIntegrationInstallation(
            stateObj?.orgSlug,
            installationId as string,
          );
          installed = true;
        } catch {
          installed = false;
        }

        // wait 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (installed) {
          break;
        }
      }

      if (!installed) {
        console.log("Installation failed");
        setErr("Installation failed");
        return;
      }
      router.push(stateObj.redirectTo);
    }

    finishInstallation().catch(() => setErr("Installation failed"));
  }, [router, searchParams]);

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
        {err ? (
          <Callout intent="danger">
            App Installation failed. Please try again.
          </Callout>
        ) : (
          <>
            <h1 className="mb-4 text-center text-2xl font-semibold">
              Finishing GitHub App installation...
            </h1>
            <p className="text-sm opacity-75">
              Please do not refresh the page. We are currently communicating
              with GitHub to finish the installation. This might take up to a
              few minutes.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Gh;
