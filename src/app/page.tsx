// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

/* eslint-disable local/require-loading-boundary -- this page only redirects and
   renders PageSkeleton itself; a loading.tsx here is the root one and would
   become the fallback for every route in the app. */
"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { useEffect } from "react";
import PageSkeleton from "../components/PageSkeleton";

const Index = () => {
  const { session, organizations } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (organizations.length === 0) {
      router.replace("/setup");
      return;
    }

    const lastActiveOrg = localStorage.getItem("lastActiveOrg");
    const target =
      lastActiveOrg && organizations.some((org) => org.slug === lastActiveOrg)
        ? lastActiveOrg
        : organizations[0].slug;

    router.replace(`/${target}`);
  }, [session, organizations, router]);

  return <PageSkeleton />;
};

export default Index;
