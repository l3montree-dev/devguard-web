// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import LoggedInAs from "@/components/misc/LoggedInAs";
import { classNames } from "../utils/common";

export default function NotFoundPage() {
  const config = useConfig();
  const user = useCurrentUser();

  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <Image
          src="/assets/404-gopher-dark.png"
          alt="404 Not Found"
          width={500}
          height={500}
          className="mx-auto h-48 w-auto rounded-lg"
        />
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-5 flex items-center justify-center gap-x-2">
          {user ? (
            <div className="flex flex-row items-center gap-4">
              <div className="text-muted-foreground flex items-center gap-4">
                You are currently logged in as <LoggedInAs user={user} />
              </div>
              <Link
                href="/"
                rel="noreferrer noopener"
                className={classNames(
                  buttonVariants({ variant: "default" }),
                  "!text-primary-foreground",
                )}
              >
                Go home
              </Link>
            </div>
          ) : (
            <div className="flex flex-row items-center gap-4">
              <p className="text-lg text-muted-foreground">
                You are not logged in.
              </p>
              <Link
                href="/login"
                rel="noreferrer noopener"
                className={classNames(
                  buttonVariants({ variant: "default" }),
                  "!text-primary-foreground",
                )}
              >
                Login
              </Link>
            </div>
          )}
          <Link
            href={config.issueTrackerUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={classNames(
              buttonVariants({ variant: "secondary" }),
              "!text-secondary-foreground",
            )}
          >
            Create an Issue
          </Link>
        </div>
      </div>
    </main>
  );
}
