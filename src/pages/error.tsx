import { Button } from "@/components/ui/button";
import { ory } from "@/services/ory";
import { FlowError } from "@ory/client";
import { AxiosError } from "axios";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useState } from "react";

const Login: NextPage = () => {
  const [error, setError] = useState<FlowError | string>();

  // Get ?id=... from the URL
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // If the router is not ready yet, or we already have an error, do nothing.
    if (!router.isReady || error) {
      return;
    }

    ory
      .getFlowError({ id: String(id) })
      .then(({ data }) => {
        setError(data);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 404:
          // The error id could not be found. Let's just redirect home!
          case 403:
          // The error id could not be fetched due to e.g. a CSRF issue. Let's just redirect home!
          case 410:
            // The error id expired. Let's just redirect home!
            return router.push("/");
        }

        return Promise.reject(err);
      });
  }, [id, router, router.isReady, error]);

  if (!error) {
    return null;
  }

  return (
    <>
      <main className="grid min-h-full place-items-center bg-[#0E1117] px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <Image
            src="/assets/investigation-gopher.png"
            alt="404 Not Found"
            width={500}
            height={500}
            className="mx-auto h-48 w-auto"
          />
          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
            An unexpected error occurred
          </h1>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Uuupss... Something went wrong!
          </h2>
          <p className="mt-6 text-pretty text-gray-400 sm:text-xl/8 max-w-4xl mx-auto">
            Sorry, we couldn’t process your request at the moment. Please try
            again later. Feel free to contact us and include the error report
            below.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login" rel="noreferrer noopener">
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
          <p className="mt-12 text-sm text-gray-500 max-w-2xl mx-auto">
            {JSON.stringify(error, null, 2)}
          </p>
        </div>
      </main>
    </>
  );
};

export default Login;
