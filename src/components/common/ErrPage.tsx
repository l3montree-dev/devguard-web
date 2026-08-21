// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getUserFullName } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CopyCode from "@/components/common/CopyCode";
import { classNames } from "../../utils/common";

interface ErrPageProps {
  error: Error & { digest?: string };
}

const AUTO_RELOAD_KEY = "errpage-last-auto-reload";
const AUTO_RELOAD_COOLDOWN_MS = 10_000;
const AUTO_RELOAD_DELAY_SECONDS = 5;

export default function ErrPage(props: ErrPageProps) {
  const { error } = props;
  const config = useConfig();
  const user = useCurrentUser();

  const [sentryEventId, setSentryEventId] = useState<string | null>(null);
  const [autoReloadSecondsLeft, setAutoReloadSecondsLeft] = useState<
    number | null
  >(null);

  useEffect(() => {
    console.error("ERROR", error);
    setSentryEventId(Sentry.captureException(error));
  }, [error]);

  let statusCode: number | null = null;
  let title = "This page hit a bug while rendering";
  let description =
    "That's on us, not your data - it's a display bug, not a lost request. Try again, and let us know if it keeps happening.";
  let homeLink = "/";
  let rawMessage: string | null = null;

  try {
    const parsed = JSON.parse(error?.message || "{}");
    if (parsed.context) {
      statusCode = parsed.context.statusCode ?? statusCode;
      title = parsed.context.title || title;
      description = parsed.context.description || description;
      homeLink = parsed.context.homeLink || homeLink;
    }
  } catch {
    rawMessage = error?.message || null;
  }

  // Must not write to sessionStorage here - see effect below.
  const [autoReloadEligible] = useState(
    () =>
      typeof window !== "undefined" &&
      Date.now() - Number(sessionStorage.getItem(AUTO_RELOAD_KEY) || 0) >
        AUTO_RELOAD_COOLDOWN_MS,
  );

  useEffect(() => {
    if (statusCode !== null || !autoReloadEligible) return;

    setAutoReloadSecondsLeft(AUTO_RELOAD_DELAY_SECONDS);
    const interval = setInterval(() => {
      setAutoReloadSecondsLeft((s) => (s === null ? s : s - 1));
    }, 1000);
    const timeout = setTimeout(() => {
      sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }, AUTO_RELOAD_DELAY_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [statusCode, autoReloadEligible]);

  const is404Like = statusCode === 404 || statusCode === 401;
  const imageSrc =
    statusCode === 500
      ? "/assets/500-gopher.png"
      : is404Like
        ? "/assets/404-gopher-dark.png"
        : "/assets/render-fail-gopher.png";

  const reference = sentryEventId ?? null;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const errorDetails = [
    `Title: ${title}`,
    `Status: ${statusCode ?? "n/a"}`,
    rawMessage ? `Message: ${rawMessage}` : null,
    reference ? `Reference: ${reference}` : null,
    `App version: ${process.env.NEXT_PUBLIC_VERSION ?? "n/a"}`,
    `URL: ${currentUrl}`,
    `Time: ${new Date().toISOString()}`,
    userAgent ? `User agent: ${userAgent}` : null,
    user
      ? `User: ${getUserFullName(user)} <${user.traits.email ?? "no email"}> (${user.id})`
      : null,
    error.stack ? `\nStack trace:\n${error.stack}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const isGithubChooser = config.issueTrackerUrl.endsWith("/issues/new/choose");
  const issueBaseUrl = isGithubChooser
    ? config.issueTrackerUrl.replace(/\/choose$/, "")
    : config.issueTrackerUrl;
  const issueParams = new URLSearchParams({
    title: `Rendering error: ${title}`,
    body: [
      "<!-- Feel free to add what you were doing when this happened -->",
      "",
      "```",
      errorDetails,
      "```",
    ].join("\n"),
  });
  if (isGithubChooser) {
    issueParams.set("template", "bug_report.md");
  }
  const issueUrl = `${issueBaseUrl}?${issueParams.toString()}`;

  return (
    <main className="grid error-boundary min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center max-w-4xl w-full">
        <Image
          src={imageSrc}
          alt={is404Like ? "404 Not Found" : "An Error Occurred"}
          width={500}
          height={500}
          className="mx-auto h-48 w-auto rounded-lg"
        />
        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
          {statusCode !== null ? `${statusCode} Error` : "Rendering Error"}
        </h1>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mt-6 text-pretty text-muted-foreground text-lg">
          {description}
        </p>

        {autoReloadSecondsLeft !== null && autoReloadSecondsLeft > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Trying automatic reload in {autoReloadSecondsLeft}s...
          </p>
        )}

        {reference && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reference: <span className="font-mono">{reference}</span>
          </p>
        )}

        <div className="mt-4 text-left">
          <p className="mb-1 text-sm text-muted-foreground">
            Technical details
          </p>
          <CopyCode codeString={errorDetails} />
        </div>

        <div className="mt-5 flex items-center justify-center gap-x-6">
          {user ? (
            <div>
              <div className="text-muted-foreground text-lg flex items-center gap-4">
                You are currently logged in as{" "}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserFullName(user)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-left text-muted-foreground">
                    {getUserFullName(user)}
                    <br />
                    {user.traits.email ? user.traits.email : "No email"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
                <Link
                  href={homeLink}
                  className={classNames(
                    buttonVariants({ variant: "secondary" }),
                    "!text-secondary-foreground",
                  )}
                  rel="noreferrer noopener"
                >
                  Go home
                </Link>
                {(statusCode === null || statusCode === 500) && (
                  <Link
                    href={issueUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={classNames(
                      buttonVariants({ variant: "secondary" }),
                      "!text-secondary-foreground",
                    )}
                  >
                    Create an Issue
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              rel="noreferrer noopener"
              className={classNames(
                buttonVariants({ variant: "default" }),
                "mt-4 !text-primary-foreground",
              )}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
