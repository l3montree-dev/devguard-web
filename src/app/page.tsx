"use client";

import { redirect } from "next/navigation";
import { useSession } from "../context/SessionContext";

const Index = () => {
  // decide where to go based on if the user has any orgs
  const { organizations } = useSession();
  if (organizations.length > 0) {
    // redirect to the first org
    redirect(`/${organizations[0].slug}`);
  } else {
    // redirect to the onboarding page
    redirect("/setup");
  }
};

export default Index;
