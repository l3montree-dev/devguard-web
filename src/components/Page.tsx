// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { HEADER_HEIGHT } from "@/const/viewConstants";
import { useGlobalNotice } from "@/hooks/useGlobalNotice";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useDimensions from "@/hooks/useDimensions";
import React, { type PropsWithChildren, useEffect } from "react";
import { toast } from "@/lib/toast";
import Markdown from "./common/Markdown";
import { Megaphone } from "lucide-react";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";
import EntityProviderBanner from "./common/EntityProviderBanner";
import EnterpriseTeaser from "./enterprise/EnterpriseTeaser";
import Footer from "./misc/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

type PageProps = {
  title: string;
  breadcrumbs?: Array<{
    title: string;
    href: string;
  }>;
};

const Page = ({
  title,
  breadcrumbs,
  children,
}: PropsWithChildren<PageProps>) => {
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

  useDocumentTitle(title);
  const dimensions = useDimensions();

  return (
    <main className="flex-1 font-body">
      <EntityProviderBanner />
      <div
        style={{ minHeight: dimensions.height - HEADER_HEIGHT - 100 }}
        className="mx-auto max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8"
      >
        {breadcrumbs && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index + 1 == breadcrumbs.length ? (
                      <BreadcrumbPage className="font-medium">
                        {breadcrumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="text-muted-foreground! font-medium"
                        href={breadcrumb.href}
                      >
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        {children}
      </div>
      <div className="bg-footer">
        <Footer variant="app" />
      </div>
      <EnterpriseTeaser />
    </main>
  );
};

export default Page;
