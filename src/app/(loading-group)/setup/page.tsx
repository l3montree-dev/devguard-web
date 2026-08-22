// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import OrgRegisterForm from "@/components/OrgRegister";
import Page from "@/components/Page";
import { useSession } from "../../../context/SessionContext";
import { redirect, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useInstanceSettings } from "@/hooks/useInstanceSettings";

const Lanyard = dynamic(
  () => import("@/components/misc/Lanyard").then((mod) => mod.default),
  { ssr: false },
);

export default function SetupOrg() {
  const session = useSession();
  const instanceSettings = useInstanceSettings();

  const lanyardKey = usePathname() ?? "setup";

  if (session.session === null) {
    redirect("/login");
  }

  if (instanceSettings?.singleOrganizationMode) {
    redirect("/accept-invitation");
  }

  return (
    <Page title="Setup Your Organization">
      <div className="">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="">
            <div className="absolute inset-0 z-10 -top-10 w-1/2">
              <Lanyard
                key={lanyardKey}
                position={[0, 0, 20]}
                gravity={[0, -40, 0]}
              />
            </div>
          </div>
          <div className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              <h2 className="text-3xl font-bold text-foreground">
                Create your VIP-Area in the
                <br />
                DevGuard Universe
              </h2>
              <OrgRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
