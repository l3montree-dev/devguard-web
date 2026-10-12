// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { toast } from "@/lib/toast";
import { innerCardClassName, type Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";
import Image from "next/image";

// the username is the last path segment of the bot profile link, e.g. https://gitlab.com/devguard-bot
const usernameFromLink = (link: string) => {
  try {
    return new URL(link).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
};

// assets synced from an external entity provider need the DevGuard bot as project member to create tickets
export default function DevGuardBotInvite({
  showTitle = true,
  variant,
}: {
  // the onboarding step has its own title
  showTitle?: boolean;
  // the surface the invite is rendered on
  variant?: Surface;
}) {
  const asset = useActiveAsset();
  const botUserLink = asset?.externalBotUserLink ?? "";
  const username = usernameFromLink(botUserLink);

  const handleCopy = () => {
    navigator.clipboard.writeText(botUserLink);
    toast("Profile URL copied to clipboard", {
      description: "You can now use it to invite the bot to your project.",
    });
  };

  return (
    <>
      {showTitle && (
        <h3 className="mb-4 font-semibold flex items-center">
          Invite the DevGuard Bot to your Project
        </h3>
      )}
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          To enable ticket creation in your project, you need to invite the
          DevGuard Bot user to your project. Simply by removing the User from
          your project, you can revoke the access at any time.
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Please ensure that you grant the DevGuard Bot user
          <span className="font-semibold text-primary">{" Reporter "}</span>
          permissions in your project.
        </p>
        <Card
          className={cn(
            "flex items-center gap-4 p-4",
            innerCardClassName(variant),
          )}
        >
          <div className="">
            <Image
              width={40}
              height={40}
              alt="DevGuard Bot Icon"
              src="/logo_icon.svg"
              className="size-10 rounded-full bg-muted-foreground outline -outline-offset-1 outline-background/5 p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">DevGuard Bot</p>
            {username && (
              <p className="truncate text-sm text-muted-foreground">
                @{username}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!botUserLink}
          >
            Copy Profile URL
          </Button>
        </Card>
      </div>
    </>
  );
}
