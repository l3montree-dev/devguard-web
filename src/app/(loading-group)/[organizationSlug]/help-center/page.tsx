"use client";

// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { cn } from "@/lib/utils";
import type {
  AssetDTO,
  Paged,
  ProjectDTO,
  VulnByPackage,
} from "@/types/api/api";
import {
  BookOpenIcon,
  CircleDotIcon,
  GitBranchIcon,
  LifeBuoyIcon,
  MapIcon,
  MessageSquareIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function HelpCenterPage() {
  const orgMenu = useOrganizationMenu();
  const activeOrg = useActiveOrg();

  const { data: projects, isLoading: isProjectsLoading } = useSWR<
    Paged<ProjectDTO>
  >(`/organizations/${activeOrg.slug}/projects/`, fetcher);
  const firstProject = projects?.data?.[0];

  const { data: resources } = useSWR<Paged<AssetDTO | ProjectDTO>>(
    firstProject
      ? `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/resources?parentId=${firstProject.id}&filterQuery[state][is]=active`
      : null,
    fetcher,
  );
  const allAssetStubs = (resources?.data ?? []).filter(
    (r): r is AssetDTO => !("type" in r),
  );

  type RepoTourTarget = {
    projectSlug: string;
    assetSlug: string;
  };
  // undefined = still searching, null = nothing found
  const [repoTourTarget, setRepoTourTarget] = useState<
    RepoTourTarget | null | undefined
  >(undefined);

  useEffect(() => {
    if (!firstProject || !resources) {
      if (projects && !firstProject) setRepoTourTarget(null);
      return;
    }
    setRepoTourTarget(undefined);

    let cancelled = false;

    const find = async () => {
      for (const stub of allAssetStubs) {
        const asset = await fetcher<AssetDTO>(
          `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${stub.slug}`,
        ).catch(() => null);
        if (cancelled) return;
        if (!asset?.refs?.length) continue;

        setRepoTourTarget({
          projectSlug: firstProject.slug,
          assetSlug: stub.slug,
        });
        return;
      }
      setRepoTourTarget(null);
    };

    find();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstProject?.slug, resources]);

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
    if (!firstProject || !resources) {
      if (projects && !firstProject) setDepRiskTarget(null);
      return;
    }
    setDepRiskTarget(undefined);

    let cancelled = false;

    const find = async () => {
      for (const stub of allAssetStubs) {
        const asset = await fetcher<AssetDTO>(
          `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${stub.slug}`,
        ).catch(() => null);
        if (cancelled) return;
        const ref = asset?.refs?.[0];
        if (!ref) continue;

        const vulns = await fetcher<Paged<VulnByPackage>>(
          `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/assets/${stub.slug}/refs/${ref.slug}/dependency-vulns/?pageSize=1`,
        ).catch(() => null);
        if (cancelled) return;
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
    return () => {
      cancelled = true;
    };
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
          : undefined;

  const repoTourHref = repoTourTarget
    ? `/${activeOrg.slug}/projects/${repoTourTarget.projectSlug}/assets/${repoTourTarget.assetSlug}?startTour=3`
    : undefined;

  const repoTourDisabledReason =
    repoTourTarget !== undefined
      ? repoTourTarget === null
        ? !firstProject
          ? "No group found"
          : !allAssetStubs.length
            ? "No repository found"
            : "Risk scanning not set up yet"
        : undefined
      : undefined;

  const isToursLoading =
    isProjectsLoading ||
    depRiskTarget === undefined ||
    repoTourTarget === undefined;

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
          {isToursLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            <>
              <ListItem
                Title={
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 text-muted-foreground w-4" />
                    Welcome Tour
                  </div>
                }
                Description="Get a guided overview of the organization dashboard."
                Button={
                  <Link
                    href={`/${activeOrg.slug}?startTour=1`}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "hover:no-underline text-primary-foreground!",
                    )}
                  >
                    Start Tour
                  </Link>
                }
              />
              <ListItem
                Title={
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 text-muted-foreground w-4" />
                    Group Tour
                  </div>
                }
                Description={
                  !firstProject
                    ? "No group found"
                    : "Learn how DevGuard helps you organize your groups."
                }
                Button={
                  firstProject ? (
                    <Link
                      href={`/${activeOrg.slug}/projects/${firstProject.slug}?startTour=2`}
                      className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "hover:no-underline",
                      )}
                    >
                      Start Tour
                    </Link>
                  ) : (
                    <Button variant="secondary" disabled>
                      Start Tour
                    </Button>
                  )
                }
              />
              <ListItem
                Title={
                  <div className="flex items-center gap-2">
                    <GitBranchIcon className="h-4 text-muted-foreground w-4" />
                    Repository Tour
                  </div>
                }
                Description={
                  repoTourDisabledReason ??
                  "Get a guided overview of managing repositories in DevGuard."
                }
                Button={
                  repoTourHref ? (
                    <Link
                      href={repoTourHref}
                      className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "hover:no-underline",
                      )}
                    >
                      Start Tour
                    </Link>
                  ) : (
                    <Button variant="secondary" disabled>
                      Start Tour
                    </Button>
                  )
                }
              />
              <ListItem
                Title={
                  <div className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    Vulnerability Management Tour
                  </div>
                }
                Description={
                  depRiskTourDisabledReason ??
                  "Learn how to find, triage, and resolve vulnerabilities across your software supply chain."
                }
                Button={
                  depRiskTourHref ? (
                    <Link
                      href={depRiskTourHref}
                      className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "hover:no-underline",
                      )}
                    >
                      Start Tour
                    </Link>
                  ) : (
                    <Button variant="secondary" disabled>
                      Start Tour
                    </Button>
                  )
                }
              />
            </>
          )}
        </Section>

        <Section
          title="Documentation"
          description="Browse our official documentation for in-depth guides, references, and integration instructions."
          forceVertical
        >
          <ListItem
            Title={
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                DevGuard Documentation
              </div>
            }
            Description="Find detailed guides on setup, integrations, vulnerability management, and more."
            Button={
              <a
                href="https://docs.devguard.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "inline-flex items-center gap-1 hover:no-underline",
                )}
              >
                Open Documentation
              </a>
            }
          />
        </Section>

        <Section
          title="Get in Touch"
          description="Can't find what you're looking for? We're here to help."
          forceVertical
        >
          <ListItem
            Title={
              <div className="flex items-center gap-2">
                <LifeBuoyIcon className="h-4 w-4 text-muted-foreground" />
                Enterprise Support
              </div>
            }
            Description="Get direct help from the DevGuard team. Available for Enterprise and Pro customers."
            Button={
              <a
                href="https://devguard.org"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "hover:no-underline text-primary-foreground!",
                )}
              >
                Contact Support
              </a>
            }
          />
          <ListItem
            Title={
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                Join the Community
              </div>
            }
            Description="Chat with other DevGuard users and the core team on Matrix."
            Button={
              <a
                href="https://matrix.to/#/#devguard:matrix.org"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "inline-flex items-center gap-1 hover:no-underline",
                )}
              >
                Open Matrix
              </a>
            }
          />
          <ListItem
            Title={
              <div className="flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                GitHub Discussions
              </div>
            }
            Description="Ask questions, share ideas, and get community feedback on GitHub Discussions."
            Button={
              <a
                href="https://github.com/l3montree-dev/devguard/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "inline-flex items-center gap-1 hover:no-underline",
                )}
              >
                Open Discussions
              </a>
            }
          />
          <ListItem
            Title={
              <div className="flex items-center gap-2">
                <CircleDotIcon className="h-4 w-4 text-muted-foreground" />
                GitHub Issues
              </div>
            }
            Description="Found a bug or want to request a feature? Open an issue on GitHub."
            Button={
              <a
                href="https://github.com/l3montree-dev/devguard/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "inline-flex items-center gap-1 hover:no-underline",
                )}
              >
                Open Issues
              </a>
            }
          />
        </Section>
      </Section>
    </Page>
  );
}
