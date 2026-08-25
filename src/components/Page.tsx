// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import Head from "next/head";
import React, { type PropsWithChildren, useEffect } from "react";
import { classNames } from "../utils/common";
import Main from "./Main";
import { toast } from "@/lib/toast";
import Markdown from "./common/Markdown";
import { Megaphone } from "lucide-react";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";

type PageProps = {
  title: string;
  description?: string;
  Title?: React.ReactNode;
  // searchActive: boolean;
  Sidebar?: React.ReactNode;
  Button?: React.ReactNode;
  Menu?: Array<{
    title: string;
    href: string;
    Icon: any;
  }>;
  fullscreen?: boolean;
  breadcrumbs?: Array<{
    title: string;
    href: string;
  }>;
};

// Add that the navigation is a prop
const Page = (props: PropsWithChildren<PageProps>) => {
  useEffect(() => {
    const STORAGE_KEY = "global-notice-updatedAt";

    fetch(`/notice`)
      .then((res) => res.json())
      .then(({ notice }) => {
        if (!notice) return;
        if (readLocalStorage(STORAGE_KEY) === notice.updatedAt) return;

        toast(<Markdown>{notice.description}</Markdown>, {
          icon: <Megaphone className="h-4 w-4" />,
          id: "global-notice",
          duration: Infinity,
          closeButton: true,
          onDismiss: () => {
            writeLocalStorage(STORAGE_KEY, notice.updatedAt);
          },
        });
      });
  }, []);
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>

      <div>
        <div className={classNames(props.Sidebar ? "lg:pr-80" : "")}>
          <Main
            breadcrumbs={props.breadcrumbs}
            fullscreen={props.fullscreen}
            Menu={props.Menu}
            Button={props.Button}
            Title={props.Title}
            title={props.title}
          >
            {props.children}
          </Main>
        </div>
        {!!props.Sidebar && (
          <aside className="bottom-0 right-0 top-0 hidden w-80 flex-1 overflow-y-auto border-l bg-card dark:text-white md:fixed lg:block">
            {props.Sidebar}
          </aside>
        )}
      </div>
    </>
  );
};

export default Page;
