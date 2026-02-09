"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ErrPage(props: { error: Error }) {
  const { error } = props;

  let statusCode = 500;
  let title = "Something went wrong!";
  let description =
    "Sorry, we couldn't process your request at the moment. Please try again later.";
  let homeLink = "/login";

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

  return (
    <>
      <main className="grid error-boundary min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <Image
            src="/assets/investigation-gopher.png"
            alt="404 Not Found"
            width={500}
            height={500}
            className="mx-auto h-48 w-auto"
          />
          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
            {statusCode} Error
          </h1>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h2>
          <p className="mt-6 text-pretty text-muted-foreground sm:text-xl/8">
            {description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href={homeLink} rel="noreferrer noopener">
              <Button variant="default">Take me home...</Button>
            </Link>
            <Link
              href="https://github.com/l3montree-dev/devguard/issues/new/choose"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="secondary">Create an Issue</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
