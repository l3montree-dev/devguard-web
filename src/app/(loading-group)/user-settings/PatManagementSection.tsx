"use client";

import AccessTokenManagement from "@/components/AccessTokenManagement";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLogoutUrl } from "@/server/actions/logout";
import Link from "next/link";
import type { FunctionComponent } from "react";
import Section from "../../../components/common/Section";
import { useConfig } from "../../../context/ConfigContext";

const PatManagementSection: FunctionComponent = () => {
  const config = useConfig();

  const handleLogout = async () => {
    const logoutUrl = await getLogoutUrl();
    window.location.href = logoutUrl;
  };

  return (
    <>
      <AccessTokenManagement
        url="/pats/"
        section={{
          title: "Manage Personal Access Tokens",
          description:
            "Personal Access Tokens allow scanners and other integrations to authenticate with DevGuard on your behalf.",
        }}
      />

      <Section
        id="request-account-deletion"
        title="Request Account Deletion"
        description="If you want to delete your account, please click the button below and send a request to our support team to delete your account."
      >
        <Card className="p-6">
          <div className="flex justify-end">
            <Link
              href={
                "mailto:" +
                config.accountDeletionMail +
                "?subject=Request%20DevGuard%20Account%20Deletion&body=Hello%2C%20%0A%0AI%20would%20like%20request%20to%20delete%20my%20DevGuard%20Account.%20%0A%0AThank%20you."
              }
            >
              <Button variant="destructive">Request Account Deletion</Button>
            </Link>
          </div>
        </Card>
      </Section>

      <div className="flex flex-row justify-end">
        <Button
          id="settings-page-logout-button"
          variant={"destructiveOutline"}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </>
  );
};

export default PatManagementSection;
