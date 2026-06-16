"use client";

import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useConfig } from "@/context/ConfigContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getUserFullName } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { classNames } from "../../utils/common";

export default function ErrPage(props: { error: Error }) {
  const { error } = props;
  const config = useConfig();
  const user = useCurrentUser();

  let statusCode = 500;
  let title = "Something went wrong!";
  let description =
    "Sorry, we couldn't process your request at the moment. Please try again later.";
  let homeLink = "/";

  // Try to parse error context from message
  try {
    const parsed = JSON.parse(error?.message || "{}");
    if (parsed.context) {
      statusCode = parsed.context.statusCode || statusCode;
      title = parsed.context.title || title;
      description = parsed.context.description || description;
      homeLink = parsed.context.homeLink || homeLink;
    }
  } catch {
    // Fall back to defaults if parsing fails
  }

  const is404Like = statusCode === 404 || statusCode === 401;
  const imageSrc = is404Like
    ? "/assets/404-gopher-dark.png"
    : "/assets/investigation-gopher.png";

  return (
    <main className="grid error-boundary min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <Image
          src={imageSrc}
          alt={is404Like ? "404 Not Found" : "An Error Occurred"}
          width={500}
          height={500}
          className="mx-auto h-48 w-auto rounded-lg"
        />
        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
          {statusCode} Error
        </h1>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mt-6 text-pretty text-muted-foreground text-lg">
          {description}
        </p>
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
              <Link
                href={homeLink}
                className={classNames(
                  buttonVariants({
                    variant: "default",
                  }),
                  "mt-4 !text-primary-foreground",
                )}
                rel="noreferrer noopener"
              >
                Go home
              </Link>
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
          {statusCode === 500 && (
            <Link
              href={config.issueTrackerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                buttonVariants({ variant: "secondary" }),
                "mt-4 !text-secondary-foreground",
              )}
            >
              Create an Issue
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
