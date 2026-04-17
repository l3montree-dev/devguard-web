// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { browserApiClient } from "@/services/devGuardApi";
import Head from "next/head";
import Footer from "@/components/misc/Footer";
import ContainerYardScene from "@/components/threejs/ContainerYardScene";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { getLogoutUrl } from "@/server/actions/logout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import FourSideGridPattern from "@/components/misc/FourSideGridPattern";

const AcceptInvitation = () => {
  const user = useCurrentUser();

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLogout = async () => {
    const logoutUrl = await getLogoutUrl();
    window.location.href = logoutUrl;
  };

  useEffect(() => {
    (async function () {
      if (!searchParams?.get("code")) {
        return;
      }

      const resp = await browserApiClient("/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: searchParams?.get("code") }),
      });

      if (!resp.ok) {
        return {
          props: {},
        };
      }

      // the invitation was accepted - redirect the user to the organization
      const { slug } = await resp.json();
      // redirect the user
      router.replace(`/${slug}`);
    })();
  }, [searchParams, router]);

  return (
    <>
      <Head>
        <title>Accept Invitation</title>
        <meta name="description" content="Accept your DevGuard invitation" />
      </Head>
      <div className="relative flex min-h-screen flex-col bg-background">
        <FourSideGridPattern />
        <div className="flex flex-1 items-center justify-center flex-col pt-8">
          <div className="w-full max-w-6xl">
            <Card className="overflow-hidden p-0">
              <CardContent className="grid p-0 md:grid-cols-5">
                {/* Left: invitation content */}
                <div className="flex flex-col justify-center p-8 col-span-2">
                  <div className="mb-6 flex justify-center">
                    <Image
                      className="hidden h-16 w-auto dark:block"
                      src={"/logo_inverse_horizontal.svg"}
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                    <Image
                      className="h-10 w-auto dark:hidden"
                      src={"/logo_horizontal.svg"}
                      alt="DevGuard by l3montree Logo"
                      width={200}
                      height={200}
                    />
                  </div>

                  <h2 className="text-center text-xl font-semibold leading-normal">
                    Accept your invitation
                  </h2>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    You have been invited to join an organization on DevGuard.
                    We just need to check you are logged in with the correct
                    account to accept the invitation.
                  </p>

                  <hr className="my-8 border-t" />

                  <div className="">
                    <h3 className="text-lg font-semibold mb-4 text-destructive">
                      Invitation failed
                    </h3>
                    {user ? (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Make sure, that you are logged in with the correct
                          Account. The invitation code is bound to a specific
                          E-Mail Address.
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground">
                          Currently logged in as:
                        </p>
                        <span className="mt-2 block rounded-lg border bg-background/70 p-2 px-2 text-sm">
                          {user.traits.email}
                        </span>
                        <div className="mt-8 flex flex-row justify-end">
                          <Button onClick={handleLogout}>Logout</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          You are not logged in. Please log in to accept the
                          invitation.
                        </p>
                        <div className="mt-8 flex flex-row">
                          <Link href="/login">
                            <Button>Login</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: container yard scene */}
                <div
                  className="col-span-3 relative hidden border-l md:block"
                  style={{ background: "hsl(var(--harbor-background))" }}
                >
                  <ContainerYardScene />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="pb-14">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default AcceptInvitation;
