"use client";

import AuthGuard from "@/components/AuthGuard";
import AssetTitle from "@/components/common/AssetTitle";
import { DocDrawer } from "@/components/common/DocDrawer";
import EmptyParty from "@/components/common/EmptyParty";
import Err from "@/components/common/Err";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Filter from "@/components/Filter";
import AddVexRuleDialog from "@/components/vex-rules/AddVexRuleDialog";
import CelPlayground from "@/components/vex-rules/CelPlayground";
import VexExportDialog from "@/components/vex-rules/VexExportDialog";
import VexRuleRecommendationList, {
  type RecommendationEntry,
} from "@/components/vex-rules/VexRuleRecommendationList";
import VexRulesTable from "@/components/vex-rules/VexRulesTable";
import {
  vexRuleRecommendationsURL,
  useVexRuleRecommendations,
} from "@/components/vex-rules/useVexRuleRecommendations";
import VexSourcesTable, {
  isVexSourceType,
  type VexSource,
} from "@/components/vex-rules/VexSourcesSection";
import VexUploadModal from "@/components/vex-rules/VexUploadModal";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type {
  ExternalReference,
  Paged,
  VexRule,
  VexRulePrefill,
} from "@/types/api/api";
import { buildFilterSearchParams } from "@/utils/url";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FunctionComponent } from "react";
import useSWR from "swr";
import Link from "next/link";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useFilter from "@/hooks/useFilter";
import useRouterQuery from "@/hooks/useRouterQuery";

const sourcesFilterOptions = [
  {
    label: "Type",
    value: "type",
    operators: [{ value: "is" }, { value: "is not" }],
    filterValues: [
      { value: "cyclonedx", label: "CycloneDX VEX" },
      { value: "csaf", label: "CSAF" },
    ],
  },
  {
    label: "URL",
    value: "url",
    operators: [{ value: "ilike", label: "contains" }],
    filterValues: [],
  },
];

const filterOptions = [
  {
    label: "Rule",
    value: "title",
    operators: [
      { value: "ilike", label: "contains" },
      { value: "is" },
      { value: "is not" },
    ],
  },
  {
    label: "CVE ID",
    value: "cveId",
    operators: [
      { value: "ilike", label: "contains" },
      { value: "is" },
      { value: "is not" },
    ],
  },
  {
    label: "Justification",
    value: "justification",
    operators: [{ value: "ilike", label: "contains" }],
    filterValues: [],
  },
  {
    label: "Source",
    value: "vex_source",
    operators: [{ value: "ilike", label: "contains" }],
    filterValues: [],
  },
  {
    label: "Result",
    value: "event_type",
    operators: [{ value: "is" }, { value: "is not" }],
    filterValues: [
      { value: "accepted", label: "Accepted" },
      { value: "falsePositive", label: "False Positive" },
    ],
  },
];

const VexRulesPage: FunctionComponent = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false);
  const [rulePrefill, setRulePrefill] = useState<VexRulePrefill>();

  const searchParams = useSearchParams();
  const handleSearch = useDebouncedQuerySearch();
  const { handleFilter, removeFilter, clearAllFilters } = useFilter();
  const pushQuery = useRouterQuery();
  const activeTab = searchParams?.get("tab") ?? "rules";
  const assetMenu = useAssetMenu();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const vexRulesUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules`;
  const query = useMemo(
    () => buildFilterSearchParams(searchParams),
    [searchParams],
  );
  const defaultQuery = useMemo(
    () => new URLSearchParams({ page: "1", pageSize: "25" }),
    [],
  );
  const rulesQuery = activeTab === "rules" ? query : defaultQuery;
  const sourcesQuery = activeTab === "sources" ? query : defaultQuery;

  const {
    data: vexRulesResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<Paged<VexRule>>(
    `${vexRulesUrl}/?${rulesQuery.toString()}`,
    fetcher,
  );
  const vexRules = vexRulesResponse?.data ?? [];

  const handleVexUpload = async (params: { file: File }) => {
    const response = await browserApiClient(`/vex`, {
      method: "POST",
      body: await params.file.text(),
      headers: {
        "X-Asset-Name": `${organizationSlug}/${projectSlug}/${assetSlug}`,
        "X-Origin": "vex-upload",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      toast.error("Failed to upload VEX file: " + errorText);
      throw new Error("Failed to upload VEX file: " + errorText);
    }

    toast.success("VEX file uploaded successfully");
    mutate();
  };

  const openCreateDialog = (celExpression?: string) => {
    setRulePrefill(celExpression ? { celExpression } : undefined);
    setAddRuleDialogOpen(true);
  };

  const vexSourcesUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/external-references`;
  const {
    data: vexSourcesResponse,
    isLoading: isVexSourcesLoading,
    mutate: mutateVexSources,
  } = useSWR<Paged<ExternalReference>>(
    `${vexSourcesUrl}/?${sourcesQuery.toString()}`,
    fetcher,
  );

  const vexSources = useMemo(
    () =>
      vexSourcesResponse && {
        ...vexSourcesResponse,
        data: vexSourcesResponse.data.filter(
          (ref): ref is VexSource => isVexSourceType(ref.type),
        ),
      },
    [vexSourcesResponse],
  );


  // Switching tabs resets search/filter/sort/page, since both tabs share
  // those query params.
  const handleTabChange = (tab: string) => {
    const reset: Record<string, undefined> = {
      search: undefined,
      page: undefined,
    };
    searchParams?.forEach((_, key) => {
      if (key.startsWith("filterQuery[") || key.startsWith("sort["))
        reset[key] = undefined;
    });
    pushQuery({ ...reset, tab });
  };

  const { recommendations } = useVexRuleRecommendations(
    vexRuleRecommendationsURL({ organizationSlug, projectSlug, assetSlug }),
  );

  if (isLoading && !vexRulesResponse) {
    return (
      <Page
        Menu={assetMenu}
        title="Loading VEX rules..."
        Title={<AssetTitle />}
      >
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page Menu={assetMenu} title="VEX rules" Title={<AssetTitle />}>
        <Err />
      </Page>
    );
  }

  return (
    <Page Menu={assetMenu} title="Manage VEX rules" Title={<AssetTitle />}>
      <Section
        primaryHeadline
        forceVertical
        title="VEX rules"
        description="VEX rules decide how vulnerabilities of this repository are handled - dismissed as a false positive, accepted as a known risk, or reopened. Rules are either written here or synced from an upstream supplier."
        className="mb-6 mt-4"
        Button={
          <div className="flex flex-row gap-2">
            <Button
              variant="secondary"
              data-testid="share-vex-button"
              onClick={() => setExportDialogOpen(true)}
            >
              Share your VEX
            </Button>
            <AuthGuard require="member">
              <Button
                variant="secondary"
                data-testid="upload-vex-button"
                onClick={() => setUploadDialogOpen(true)}
              >
                Add a VEX-File or VEX-URL
              </Button>
            </AuthGuard>
          </div>
        }
      >
        <div className="-mt-2">
          <DocDrawer
            triggerLabel="Learn about CSAF/VEX"
            drawerTitle="CSAF/VEX Explained"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/compliance/csaf-vex-explained.mdx"
            docsUrl="https://docs.devguard.org/explanations/compliance/csaf-vex-explained/"
          />
        </div>

        <AuthGuard require="member">
          <CelPlayground
            baseUrl={vexRulesUrl}
            onCreateRule={openCreateDialog}
          />
        </AuthGuard>
      </Section>

      <Section forceVertical className="mb-6 border-t pt-6">
        <Tabs value={activeTab}>
          <TabsList>
            <TabsTrigger
              data-testid="vex-rules-tab-rules"
              onClick={() => handleTabChange("rules")}
              value="rules"
            >
              VEX rules
              {!!vexRulesResponse?.total && (
                <Badge variant="secondary" className="ml-2 font-medium">
                  {vexRulesResponse.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-testid="vex-rules-tab-recommendations"
              onClick={() => handleTabChange("recommendations")}
              value="recommendations"
            >
              Recommendations
              {recommendations.length > 0 && (
                <Badge variant="secondary" className="ml-2 font-medium">
                  {recommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-testid="vex-rules-tab-sources"
              onClick={() => handleTabChange("sources")}
              value="sources"
            >
              Upstream VEX sources
              {!!vexSources?.total && (
                <Badge variant="secondary" className="ml-2 font-medium">
                  {vexSources.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4">
            <div className="mb-4 flex flex-row gap-2">
              <Filter
                options={filterOptions}
                onFilter={handleFilter}
                onRemoveFilter={removeFilter}
                onClearAllFilters={clearAllFilters}
                search={{
                  onChange: handleSearch,
                  defaultValue: searchParams?.get("search") ?? "",
                  placeholder:
                    "Search VEX rules by title, justification, or CVE ID...",
                }}
              />
            </div>
            {vexRules.length === 0 ? (
              <EmptyParty
                title="No VEX rules found."
                description="VEX rules define how vulnerabilities are handled based on their context. Try an expression in the playground above to create your first rule, or sync one from an upstream source."
              />
            ) : (
              <VexRulesTable
                rules={
                  vexRulesResponse ?? {
                    data: [],
                    total: 0,
                    page: 1,
                    pageSize: 25,
                  }
                }
                urlBase={vexRulesUrl}
                isLoading={isLoading}
                onMutate={() => mutate()}
              />
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <p className="mb-4 text-sm leading-6 text-muted-foreground">
              Other users of DevGuard assessed vulnerabilities that are found in
              your repository already. Based on a majority vote, the following
              VEX rules are recommended. Nothing is applied until you create the
              rule. You can find the list of official upstream sources that
              devguard syncs{" "}
              <Link
                href={
                  "https://github.com/l3montree-dev/devguard/blob/main/vulndb/upstream_vex_service.go#L27"
                }
                target="_blank"
              >
                in the GitHub repository
              </Link>
              .
            </p>
            {recommendations.length === 0 ? (
              <EmptyParty
                title="No recommendations yet."
                description="Recommendations appear once other DevGuard users or upstream sources have assessed vulnerabilities that also show up in this repository."
              />
            ) : (
              <AuthGuard require="member">
                <VexRuleRecommendationList
                  recommendations={recommendations}
                  onCreateRule={(entry: RecommendationEntry) => {
                    setRulePrefill({
                      celExpression: entry.recommendation.celExpression,
                      justification: entry.recommendation.justification,
                      mechanicalJustification:
                        entry.recommendation.mechanicalJustification,
                      wasRecommended: true,
                      title: entry.recommendation.title,
                    });
                    setAddRuleDialogOpen(true);
                  }}
                />
              </AuthGuard>
            )}
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <p className="mb-4 text-sm leading-6 text-muted-foreground">
              URLs, usually provided by your suppliers, that carry VEX data for
              the components you use. Syncing a source creates the rules listed
              in the VEX rules tab.
            </p>
            <div className="mb-4 flex flex-row gap-2">
              <Filter
                options={sourcesFilterOptions}
                onFilter={handleFilter}
                onRemoveFilter={removeFilter}
                onClearAllFilters={clearAllFilters}
                search={{
                  onChange: handleSearch,
                  defaultValue: searchParams?.get("search") ?? "",
                  placeholder: "Search upstream sources by URL...",
                }}
              />
            </div>
            <VexSourcesTable
              sources={
                vexSources ?? {
                  data: [],
                  total: 0,
                  page: 1,
                  pageSize: 25,
                }
              }
              apiUrl={vexSourcesUrl}
              isLoading={isVexSourcesLoading}
              onMutate={() => mutateVexSources()}
              onAddSource={() => setUploadDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </Section>

      <VexUploadModal
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleVexUpload}
      />
      <AddVexRuleDialog
        open={addRuleDialogOpen}
        onOpenChange={setAddRuleDialogOpen}
        baseUrl={vexRulesUrl}
        onCreated={() => mutate()}
        prefill={rulePrefill}
      />
      <VexExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </Page>
  );
};

export default VexRulesPage;
