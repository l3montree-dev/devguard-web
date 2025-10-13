"use client";
import { browserApiClient } from "@/services/devGuardApi";
import Head from "next/head";

import ThreeJSFeatureScreen from "@/components/threejs/ThreeJSFeatureScreen";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { LogoutLink } from "../../hooks/logoutLink";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const AcceptInvitation = () => {
  const user = useCurrentUser();

  const handleLogout = LogoutLink();
  const searchParams = useSearchParams();
  const router = useRouter();

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
        <title>Invite User</title>
        <meta name="description" content="Invitation failed" />
      </Head>
      <div className="flex min-h-screen flex-1 flex-row">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-8 xl:px-24">
            <div className="">
              <Image
                className="hidden h-14 w-auto dark:block"
                src={"/logo_inverse_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-16 w-auto dark:hidden"
                src={"/logo_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="mt-10 text-left font-display text-2xl font-bold leading-9 tracking-tight">
                Accept your invitation
              </h2>
              <Card className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
                <CardHeader>
                  <CardTitle>Invitation failed</CardTitle>
                </CardHeader>

                <CardContent>
                  <div>
                    <div className="mt-2">
                      {user ? (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Make sure, that you are logged in with the correct
                            Account. The invitation code is bound to a specific
                            E-Mail Address.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Currently logged in as:
                          </p>
                          <span className="mt-2 block rounded-lg border bg-background/70 p-1 px-2 text-sm">
                            {user ? user.traits.email : "Not logged in"}
                          </span>
                          <div className="mt-4 flex flex-row justify-end">
                            <Button onClick={handleLogout}>Logout</Button>
                          </div>
                        </div>
                      ) : (
                        //redirect to login page if not logged in
                        <div>
                          <p className="text-sm text-muted-foreground">
                            You are not logged in. Please log in to accept the
                            invitation.
                          </p>
                          <div className="mt-4 flex flex-row justify-end">
                            <Link href="/login">
                              <Button>Login</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <ThreeJSFeatureScreen />
      </div>
    </>
  );
};

export default AcceptInvitation;
