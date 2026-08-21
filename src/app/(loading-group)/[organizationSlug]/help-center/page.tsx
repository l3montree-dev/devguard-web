// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import HelpCenterItem from "@/components/help-center/HelpCenterItem";
import SupportSection from "@/components/help-center/SupportSection";
import Page from "@/components/Page";
import { Skeleton } from "@/components/ui/skeleton";
import { useHelpCenter } from "@/hooks/useHelpCenter";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import {
  BookOpenIcon,
  GitBranchIcon,
  MapIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default function HelpCenterPage() {
  const orgMenu = useOrganizationMenu();
  const { isLoading, welcomeTour, groupTour, repoTour, depRiskTour } =
    useHelpCenter();

  return (
    <Page Title={null} title="Help Center" Menu={orgMenu}>
      <Section
        primaryHeadline
        title="Help Center"
        description="New to DevGuard or want to explore specific features? Start an interactive tour to get familiar with the platform at your own pace."
        forceVertical
      >
        <Section
          title="Interactive Tours"
          description="Click a tour to jump right in. You'll be guided step by step."
          forceVertical
        >
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            <>
              <HelpCenterItem
                Icon={MapIcon}
                title="Welcome Tour"
                description="Get a guided overview of the organization dashboard."
                actionLabel="Start Tour"
                href={welcomeTour.href}
                variant="default"
              />
              <HelpCenterItem
                Icon={ShieldCheckIcon}
                title="Group Tour"
                description={
                  groupTour.disabledReason ??
                  "Learn how DevGuard helps you organize your groups."
                }
                actionLabel="Start Tour"
                href={groupTour.href}
              />
              <HelpCenterItem
                Icon={GitBranchIcon}
                title="Repository Tour"
                description={
                  repoTour.disabledReason ??
                  "Get a guided overview of managing repositories in DevGuard."
                }
                actionLabel="Start Tour"
                href={repoTour.href}
              />
              <HelpCenterItem
                Icon={SearchIcon}
                title="Vulnerability Management Tour"
                description={
                  depRiskTour.disabledReason ??
                  "Learn how to find, triage, and resolve vulnerabilities across your software supply chain."
                }
                actionLabel="Start Tour"
                href={depRiskTour.href}
              />
            </>
          )}
        </Section>

        <Section
          title="Documentation"
          description="Browse our official documentation for in-depth guides, references, and integration instructions."
          forceVertical
        >
          <HelpCenterItem
            Icon={BookOpenIcon}
            title="DevGuard Documentation"
            description="Find detailed guides on setup, integrations, vulnerability management, and more."
            actionLabel="Open Documentation"
            href="https://docs.devguard.org/"
            external
          />
        </Section>

        <SupportSection />
      </Section>
    </Page>
  );
}
