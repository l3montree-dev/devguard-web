"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { useEffect } from "react";

const Index = () => {
  const { organizations } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (organizations.length > 0) {
      const lastActiveOrg = localStorage.getItem("lastActiveOrg");
      if (lastActiveOrg) {
        const orgExists = organizations.some(
          (org) => org.slug === lastActiveOrg,
        );
        if (orgExists) {
          router.replace(`/${lastActiveOrg}`);
        } else {
          router.replace(`/${organizations[0].slug}`);
        }
      } else {
        router.replace(`/${organizations[0].slug}`);
      }
    } else {
      router.replace("/setup");
    }
  }, [organizations, router]);

  return null;
};

export default Index;
