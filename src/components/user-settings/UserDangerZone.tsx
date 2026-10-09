// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import DangerZone from "@/components/common/DangerZone";
import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { getLogoutUrl } from "@/server/actions/logout";
import Link from "next/link";

const DELETION_MAIL_QUERY =
  "?subject=Request%20DevGuard%20Account%20Deletion&body=Hello%2C%20%0A%0AI%20would%20like%20request%20to%20delete%20my%20DevGuard%20Account.%20%0A%0AThank%20you.";

const UserDangerZone = () => {
  const config = useConfig();

  const handleLogout = async () => {
    window.location.href = await getLogoutUrl();
  };

  return (
    <DangerZone>
      <div className="flex flex-col gap-4">
        <ListItem
          Title="Logout"
          Description="End your current session on this device."
          Button={
            <Button
              id="settings-page-logout-button"
              variant="destructiveOutline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          }
        />
        <ListItem
          Title="Request Account Deletion"
          Description="Send a request to our support team to delete your account."
          Button={
            <Link
              href={`mailto:${config.accountDeletionMail}${DELETION_MAIL_QUERY}`}
            >
              <Button variant="destructive">Request Account Deletion</Button>
            </Link>
          }
        />
      </div>
    </DangerZone>
  );
};

export default UserDangerZone;
