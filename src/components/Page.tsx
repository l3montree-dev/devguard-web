// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { useGlobalNotice } from "@/hooks/useGlobalNotice";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import React, { type PropsWithChildren, useEffect } from "react";
import Main from "./Main";
import { toast } from "@/lib/toast";
import Markdown from "./common/Markdown";
import { Megaphone } from "lucide-react";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";

type PageProps = {
  title: string;
  breadcrumbs?: Array<{
    title: string;
    href: string;
  }>;
};

// Add that the navigation is a prop
const Page = (props: PropsWithChildren<PageProps>) => {
  const notice = useGlobalNotice();

  useEffect(() => {
    const STORAGE_KEY = "global-notice-updatedAt";
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
  }, [notice]);

  useDocumentTitle(props.title);

  return (
    <div>
      <Main breadcrumbs={props.breadcrumbs} title={props.title}>
        {props.children}
      </Main>
    </div>
  );
};

export default Page;
