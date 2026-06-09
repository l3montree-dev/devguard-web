// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { PropsWithChildren } from "react";
import type {
  OryCardContentProps,
  OryCardSettingsSectionProps,
  OryFormSectionContentProps,
  OryFormSectionFooterProps,
} from "@ory/elements-react";
import {
  DefaultCardFooter,
  DefaultCardHeader,
} from "@ory/elements-react/theme";
import Section from "@/components/common/Section";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function OryCardRoot({ children }: PropsWithChildren) {
  return <Card className="ory-card border-0 shadow-none">{children}</Card>;
}

// Transparent root for layouts that provide their own card wrapper (e.g. login page)
export function OryCardRootTransparent({ children }: PropsWithChildren) {
  return <div className="ory-card">{children}</div>;
}

export function OryCardHeader() {
  return (
    <div className="text-center">
      <DefaultCardHeader />
    </div>
  );
}

export function OryCardFooter() {
  return (
    <div className="text-center">
      <DefaultCardFooter />
    </div>
  );
}

export function OryCardContent({ children }: OryCardContentProps) {
  return <CardContent className="p-0">{children}</CardContent>;
}

export function OryCardDivider() {
  return (
    <div className="relative my-4">
      <Separator />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-card px-2 text-xs text-muted-foreground">
          or continue with
        </span>
      </div>
    </div>
  );
}

export function OrySettingsSection({
  children,
  action,
  method,
  onSubmit,
}: OryCardSettingsSectionProps) {
  return (
    <form action={action} method={method} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function OrySettingsSectionContent({
  children,
  title,
  description,
}: OryFormSectionContentProps) {
  return (
    <Section Title={title} description={description} className="space-y-4">
      <Card className="p-6 flex flex-col gap-4">{children}</Card>
    </Section>
  );
}

export function OrySettingsSectionFooter(props: OryFormSectionFooterProps) {
  return (
    <CardFooter className="justify-end px-0 pb-0 pb-4 border-b border-border mt-4">
      {props.children}
    </CardFooter>
  );
}
