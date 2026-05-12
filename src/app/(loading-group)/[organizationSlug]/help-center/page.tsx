"use client";

// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Page from "@/components/Page";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import type {
  AssetDTO,
  Paged,
  ProjectDTO,
  VulnByPackage,
} from "@/types/api/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapIcon,
  ShieldCheckIcon,
  GitBranchIcon,
  SearchIcon,
  LifeBuoyIcon,
  UsersIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  BookOpenIcon,
  CircleDotIcon,
} from "lucide-react";
import { classNames } from "@/utils/common";

interface TourCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
  accent?: boolean;
}

function TourBentoCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 h-full">
      <Skeleton className="w-11 h-11 rounded-lg" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function TourBentoCard({
  icon,
  title,
  description,
  href,
  disabled,
  disabledReason,
  accent,
}: TourCardProps) {
  const inner = (
    <div
      className={classNames(
        "flex flex-col gap-4 rounded-xl border p-6 h-full transition-colors",
        disabled
          ? "border-border bg-card opacity-50 cursor-not-allowed"
          : accent
            ? "border-primary/40 bg-primary/10 hover:bg-primary/20 cursor-pointer"
            : "border-border bg-card hover:bg-accent cursor-pointer",
      )}
    >
      <div
        className={classNames(
          "flex items-center justify-center w-11 h-11 rounded-lg",
          accent ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={
            accent ? "text-primary-foreground" : "text-muted-foreground"
          }
        >
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {!disabled && (
        <span
          className={classNames(
            "text-xs font-medium",
            accent ? "text-primary" : "text-muted-foreground",
          )}
        >
          Start Tour →
        </span>
      )}
      {disabled && (
        <span className="text-xs font-medium text-muted-foreground">
          {disabledReason ?? "Currently not available"}
        </span>
      )}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="hover:no-underline">
        {inner}
      </Link>
    );
  }

  return <div>{inner}</div>;
}

interface SupportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  accent?: boolean;
}

function SupportBentoCard({
  icon,
  title,
  description,
  cta,
  href,
  external,
  accent,
}: SupportCardProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="hover:no-underline"
    >
      <div
        className={classNames(
          "flex flex-col gap-4 rounded-xl border p-6 h-full transition-colors cursor-pointer",
          accent
            ? "border-primary/40 bg-primary/10 hover:bg-primary/20"
            : "border-border bg-card hover:bg-accent",
        )}
      >
        <div
          className={classNames(
            "flex items-center justify-center w-11 h-11 rounded-lg",
            accent ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={
              accent ? "text-primary-foreground" : "text-muted-foreground"
            }
          >
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          {cta}
          {external && <ExternalLinkIcon className="h-3 w-3" />}
        </span>
      </div>
    </a>
  );
}

export default function HelpCenterPage() {
  const orgMenu = useOrganizationMenu();
  const activeOrg = useActiveOrg();

  const { data: projects } = useSWR<Paged<ProjectDTO>>(
    `/organizations/${activeOrg.slug}/projects/`,
    fetcher,
  );
  const firstProject = projects?.data?.[0];

  const { data: resources } = useSWR<Paged<AssetDTO | ProjectDTO>>(
    firstProject
      ? `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/resources?parentId=${firstProject.id}&filterQuery[state][is]=active`
      : null,
    fetcher,
  );
  const firstAssetStub = resources?.data?.find(
    (r): r is AssetDTO => !("type" in r),
  );

  const { data: firstAsset } = useSWR<AssetDTO>(
    firstProject && firstAssetStub
      ? `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${firstAssetStub.slug}`
      : null,
    fetcher,
  );

  const isRiskScanningSetUp = Boolean(firstAsset?.refs?.length);

  const allAssetStubs = (resources?.data ?? []).filter(
    (r): r is AssetDTO => !("type" in r),
  );

  type DepRiskTarget = {
    projectSlug: string;
    assetSlug: string;
    refSlug: string;
    vulnId: string;
  };
  // undefined = still searching, null = nothing found
  const [depRiskTarget, setDepRiskTarget] = useState<
    DepRiskTarget | null | undefined
  >(undefined);

  useEffect(() => {
    if (!firstProject || !resources) return;
    setDepRiskTarget(undefined);

    const find = async () => {
      for (const stub of allAssetStubs) {
        const asset = await fetcher<AssetDTO>(
          `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${stub.slug}`,
        ).catch(() => null);
        const ref = asset?.refs?.[0];
        if (!ref) continue;

        const vulns = await fetcher<Paged<VulnByPackage>>(
          `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${stub.slug}/refs/${ref.slug}/dependency-vulns/?pageSize=1`,
        ).catch(() => null);
        const vulnId = vulns?.data?.[0]?.vulns?.[0]?.id;
        if (!vulnId) continue;

        setDepRiskTarget({
          projectSlug: firstProject.slug,
          assetSlug: stub.slug,
          refSlug: ref.slug,
          vulnId,
        });
        return;
      }
      setDepRiskTarget(null);
    };

    find();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstProject?.slug, resources]);

  const depRiskTourHref = depRiskTarget
    ? `/${activeOrg.slug}/projects/${depRiskTarget.projectSlug}/assets/${depRiskTarget.assetSlug}/refs/${depRiskTarget.refSlug}/dependency-risks/${depRiskTarget.vulnId}?startTour=4`
    : undefined;

  const depRiskTourDisabledReason =
    depRiskTarget !== undefined
      ? depRiskTarget === null
        ? "No vulnerabilities found"
        : undefined
      : !firstProject
        ? "No group found"
        : !allAssetStubs.length
          ? "No repository found"
          : !isRiskScanningSetUp
            ? "Risk scanning not set up yet"
            : undefined;

  const repoTourHref =
    firstProject && firstAssetStub && isRiskScanningSetUp
      ? `/${activeOrg.slug}/projects/${firstProject.slug}/assets/${firstAssetStub.slug}?startTour=3`
      : undefined;

  const repoTourDisabledReason = !firstProject
    ? "No group found"
    : !firstAssetStub
      ? "No repository found"
      : !isRiskScanningSetUp
        ? "Risk scanning not set up yet"
        : undefined;

  const isToursLoading = depRiskTarget === undefined;

  return (
    <Page Title={null} title="Help Center" Menu={orgMenu}>
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Help Center
          </h1>
        </div>
        <p className="text-muted-foreground text-base max-w-2xl">
          New to DevGuard or want to explore specific features? Start an
          interactive tour to get familiar with the platform at your own pace.
        </p>
      </div>

      {/* Tours */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Interactive Tours
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click a tour to jump right in. You&apos;ll be guided step by step.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {isToursLoading ? (
            <>
              <TourBentoCardSkeleton />
              <TourBentoCardSkeleton />
              <TourBentoCardSkeleton />
              <TourBentoCardSkeleton />
            </>
          ) : (
            <>
              <TourBentoCard
                icon={<MapIcon className="h-5 w-5" />}
                title="Welcome Tour"
                description="Get a guided overview of the organization dashboard."
                href={`/${activeOrg.slug}?startTour=1`}
                accent
              />
              <TourBentoCard
                icon={<ShieldCheckIcon className="h-5 w-5" />}
                title="Group Tour"
                description="Learn how DevGuard helps you organize your groups."
                href={
                  firstProject
                    ? `/${activeOrg.slug}/projects/${firstProject.slug}?startTour=2`
                    : undefined
                }
                disabled={!firstProject}
                disabledReason={!firstProject ? "No group found" : undefined}
              />
              <TourBentoCard
                icon={<GitBranchIcon className="h-5 w-5" />}
                title="Repository Tour"
                description="Get a guided overview of managing repositories in DevGuard."
                href={repoTourHref}
                disabled={!repoTourHref}
                disabledReason={repoTourDisabledReason}
              />
              <TourBentoCard
                icon={<SearchIcon className="h-5 w-5" />}
                title="Vulnerability Management Tour"
                description="Learn how to find, triage, and resolve vulnerabilities across your software supply chain."
                href={depRiskTourHref}
                disabled={!depRiskTourHref}
                disabledReason={depRiskTourDisabledReason}
              />
            </>
          )}
        </div>
      </div>

      {/* Documentation Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Documentation
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Browse our official documentation for in-depth guides, references, and
          integration instructions.
        </p>
        <SupportBentoCard
          icon={<BookOpenIcon className="h-5 w-5" />}
          title="DevGuard Documentation"
          description="Find detailed guides on setup, integrations, vulnerability management, and more."
          cta="Open Documentation"
          href="https://docs.devguard.org/"
          external
        />
      </div>

      {/* Contact Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Get in Touch
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
        </p>

        {/* Enterprise Support */}
        <SupportBentoCard
          icon={<LifeBuoyIcon className="h-5 w-5" />}
          title="Enterprise Support"
          description="Get direct help from the DevGuard team. Available for Enterprise and Pro customers."
          cta="Contact support"
          href="https://devguard.org"
          accent
        />

        {/* Community Support */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <SupportBentoCard
            icon={<UsersIcon className="h-5 w-5" />}
            title="Join the Community"
            description="Chat with other DevGuard users and the core team on Matrix."
            cta="Open Matrix"
            href="matrix url"
            external
          />
          <SupportBentoCard
            icon={<MessageSquareIcon className="h-5 w-5" />}
            title="GitHub Discussions"
            description="Ask questions, share ideas, and get community feedback on GitHub Discussions."
            cta="Open Discussions"
            href="https://github.com/l3montree-dev/devguard/discussions"
            external
          />
          <SupportBentoCard
            icon={<CircleDotIcon className="h-5 w-5" />}
            title="GitHub Issues"
            description="Found a bug or want to request a feature? Open an issue on GitHub."
            cta="Open Issues"
            href="https://github.com/l3montree-dev/devguard/issues"
            external
          />
        </div>
      </div>
    </Page>
  );
}
