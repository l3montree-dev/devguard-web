import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const Err = () => {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md">
      <div className="flex flex-col items-center justify-center p-10">
        <Image
          src="/assets/investigation-gopher.png"
          alt="404 Not Found"
          width={500}
          height={500}
          className="mx-auto h-48 w-auto"
        />

        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-xl">
          Uuupss... Something went wrong!
        </h2>
        <p className="mt-6 text-pretty text-muted-foreground sm:text-xl/8">
          Sorry, we couldn’t process your request at the moment. Please try
          again later.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-3">
          <Link
            href="https://github.com/l3montree-dev/devguard/issues/new/choose"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button variant="secondary">Create an Issue on GitHub</Button>
          </Link>
          <Link
            href="https://matrix.to/#/#devguard:matrix.org"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button variant="secondary">Ask for support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Err;
