import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function InternalServerErrorPage() {
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
            500 Internal Server Error
          </h1>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Uuupss... Something went wrong!
          </h2>
          <p className="mt-6 text-pretty text-gray-400 sm:text-xl/8">
            Sorry, we couldn’t process your request at the moment. Please try
            again later.
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
        </div>
      </main>
    </>
  );
}
