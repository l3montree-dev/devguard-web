"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { useEffect } from "react";

const Index = () => {
  const { organizations } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("organizations in index", organizations);
    if (organizations.length > 0) {
      const lastActiveOrg = localStorage.getItem("lastActiveOrg");
      console.log("last active org in index before redirect", lastActiveOrg);
      if (lastActiveOrg) {
        const orgExists = organizations.some(
          (org) => org.slug === lastActiveOrg,
        );
        if (orgExists) {
          console.log(
            "after checking org exists, redirecting to last active org",
            lastActiveOrg,
          );
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
