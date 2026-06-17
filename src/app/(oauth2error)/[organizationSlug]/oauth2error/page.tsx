"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

export default function OAuth2ErrorPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = use(params);

  const providerId = decodeURIComponent(organizationSlug).replace("@", "");
  const reauthorizeUrl =
    "/api/devguard-tunnel/api/v1/oauth2/gitlab/" +
    providerId +
    "?redirectTo=" +
    encodeURIComponent("/" + organizationSlug);

  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <Image
          src="/assets/investigation-gopher.png"
          alt="Authorization required"
          width={500}
          height={500}
          className="mx-auto h-48 w-auto"
        />
        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
          403 Error
        </h1>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Reauthorization required
        </h2>
        <p className="mt-6 text-pretty text-muted-foreground sm:text-xl/8">
          DevGuard lost access to your{" "}
          <span className="font-medium text-foreground">
            {decodeURIComponent(organizationSlug)}
          </span>{" "}
          provider account. Click <strong>Reauthorize</strong> to reconnect.
        </p>
        <p className="mt-3 mx-auto max-w-3xl text-pretty text-muted-foreground">
          This can happen even right after login. Ory Kratos — the identity
          layer used here — only stores your provider token at registration and
          never updates it on later logins (
          <Link
            href="https://github.com/ory/kratos/pull/2428"
            target="_blank"
            rel="noreferrer noopener"
            className="underline"
          >
            ory/kratos#2428
          </Link>
          ). Reauthorizing bypasses Kratos and lets DevGuard obtain a fresh
          token directly, which it encrypts and stores securely.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a href={reauthorizeUrl}>
            <Button variant="default">Reauthorize</Button>
          </a>
          <Link href="/">
            <Button variant="secondary">Go to home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
