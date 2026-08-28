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
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Form } from "../../components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { InvitationForm } from "@/components/InvitationForm";
import { getLogoutUrl } from "@/server/actions/logout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import FourSideGridPattern from "@/components/misc/FourSideGridPattern";
import LoggedInAs from "@/components/misc/LoggedInAs";
import { extractInvitationCode } from "@/utils/url";

import type { InvitationFormValues } from "@/types/view/invitation";

const AcceptInvitation = () => {
  const user = useCurrentUser();

  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<InvitationFormValues>();
  const [failed, setFailed] = useState(false);

  const code = searchParams?.get("code");

  const handleLogout = async () => {
    const logoutUrl = await getLogoutUrl();
    window.location.href = logoutUrl;
  };

  const acceptCode = useCallback(
    async (code: string) => {
      const resp = await browserApiClient("/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!resp.ok) {
        return false;
      }

      const { slug } = await resp.json();
      localStorage.setItem("lastActiveOrg", slug);
      router.replace(`/${slug}`);
      return true;
    },
    [router],
  );

  const handleJoinOrganization = useCallback(
    async (data: InvitationFormValues) => {
      const pasted = extractInvitationCode(data["invitation-url"]);

      if (!pasted) {
        form.setError("invitation-url", {
          type: "manual",
          message: "Please enter a valid invitation url or code.",
        });
        return;
      }

      setFailed(!(await acceptCode(pasted)));
    },
    [acceptCode, form],
  );

  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (!code || autoSubmitted.current) {
      return;
    }
    autoSubmitted.current = true;
    form.setValue("invitation-url", code);
    form.handleSubmit(handleJoinOrganization)();
  }, [code, form, handleJoinOrganization]);

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
                    Join your organization
                  </h2>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Paste the invitation link you received by e-mail. It is
                    bound to a specific e-mail address, so you need to be logged
                    in with the invited account.
                  </p>

                  <hr className="my-8 border-t" />

                  {!user ? (
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
                  ) : (
                    <div>
                      {failed && (
                        <Alert variant="destructive" className="mb-6">
                          <AlertTitle>
                            That invitation could not be accepted
                          </AlertTitle>
                          <AlertDescription>
                            It may have expired, already been used, or belong to
                            a different e-mail address.
                          </AlertDescription>
                        </Alert>
                      )}
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleJoinOrganization)}
                        >
                          <InvitationForm
                            title="Invitation"
                            description="Enter the invitation link or code you received."
                            inputVariant="onCard"
                            className="pb-2"
                          />
                          <Button
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                            isSubmitting={form.formState.isSubmitting}
                            type="submit"
                          >
                            Join Organization
                          </Button>
                        </form>
                      </Form>
                      <div className="mt-8 flex flex-row items-center justify-between gap-4">
                        <LoggedInAs user={user} />
                        <Button variant="secondary" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: container yard scene */}
                <div
                  className="col-span-3 relative hidden border-l md:block"
                  style={{ background: "hsl(var(--harbor-background))" }}
                  id="container-yard-scene"
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
