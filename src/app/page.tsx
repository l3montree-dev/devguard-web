"use client";

import { redirect } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { useEffect } from "react";

const Index = () => {
  const { organizations } = useSession();

  useEffect(() => {
    const lastActiveOrg = localStorage.getItem("lastActiveOrg");
    if (lastActiveOrg) {
      // Check if the last active org is still in the user's org list
      const orgExists = organizations.some((org) => org.slug === lastActiveOrg);
      if (orgExists) {
        redirect(`/${lastActiveOrg}`);
      }
    }
    if (organizations.length > 0) {
      redirect(`/${organizations[0].slug}`);
    } else {
      redirect("/setup");
    }
  }, [organizations]);

  return null;
};

export default Index;
