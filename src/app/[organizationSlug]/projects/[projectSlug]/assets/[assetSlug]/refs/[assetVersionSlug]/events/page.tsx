"use client";

import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { Paged, VulnEventDTO } from "@/types/api/api";
import { FunctionComponent } from "react";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { buildFilterSearchParams } from "@/utils/url";
import VulnEventItem from "@/components/VulnEventItem";
import Section from "@/components/common/Section";
import useSWR from "swr";
import { fetcher } from "@/hooks/useApi";
import useDecodedParams from "@/hooks/useDecodedParams";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

const Index = () => {
  const params = useDecodedParams();
  const searchParams = useSearchParams();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } = params;

  // Build the API URL
  let url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}`;
  if (assetVersionSlug) {
    url += `/refs/${assetVersionSlug}`;
  }
  url += `/events/?${searchParams?.toString() || ""}`;

  // Fetch events data using SWR
  const {
    data: events,
    error,
    isLoading,
  } = useSWR<Paged<VulnEventDTO>>(url, fetcher);

  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();

  // Show loading skeleton if data is loading
  if (isLoading || !events) {
    return (
      <Page title="Loading Events...">
        <div className="space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-24" />
            ))}
          </div>
        </div>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page title="Error Loading Events">
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load events</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </Page>
    );
  }

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <BranchTagSelector branches={branches} tags={tags} />

      <Section
        description="Displays the last events that happened on the asset."
        primaryHeadline
        forceVertical
        title="Activity-Stream"
      >
        <div>
          <div>
            <ul
              className="relative flex flex-col gap-10 pb-10 text-foreground"
              role="list"
            >
              <div className="absolute left-3 h-full border-l border-r bg-secondary" />
              {events.data.map((event, index, events) => {
                return (
                  <VulnEventItem
                    key={event.id}
                    event={event}
                    index={index}
                    events={events}
                  />
                );
              })}
            </ul>
          </div>

          <div className="mt-4">
            <CustomPagination {...events} />
          </div>
        </div>
      </Section>
    </Page>
  );
};

export default Index;
