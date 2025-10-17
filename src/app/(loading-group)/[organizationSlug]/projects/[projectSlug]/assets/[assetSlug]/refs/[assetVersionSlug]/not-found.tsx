import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <>
      <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <Image
            src="/assets/404-gopher-dark.png"
            alt="404 Not Found"
            width={500}
            height={500}
            className="mx-auto h-48 w-auto rounded-lg"
          />
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
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
