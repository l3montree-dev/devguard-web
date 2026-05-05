// Copyright (C) 2023 Lars Hermges, l3montree GMBH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Footer from "@/components/misc/Footer";

export default function NotSupported() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="grid flex-1 place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <Image
            src="/assets/nosupport-gopher.png"
            alt="DevGuard does not support mobile yet"
            width={500}
            height={500}
            className="mx-auto h-48 w-auto rounded-lg"
          />
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            No mobile support
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
            DevGuard isn&rsquo;t optimized for small screens yet. Please open it
            on a desktop browser &mdash; and if mobile support matters to you,
            cast your vote on the GitHub discussion.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://devguard.org"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="default">To devguard.org</Button>
            </a>
            <a
              href="https://github.com/l3montree-dev/devguard/discussions/1923"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="secondary">
                <Image
                  src="/assets/github.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="mr-2 dark:invert"
                />
                Vote on GitHub
              </Button>
            </a>
          </div>
        </div>
      </main>
      <div className="pb-6">
        <Footer />
      </div>
    </div>
  );
}
