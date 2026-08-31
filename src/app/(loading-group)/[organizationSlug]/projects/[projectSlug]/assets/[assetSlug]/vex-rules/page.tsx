// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import AssetTitle from "@/components/common/AssetTitle";
import { DocDrawer } from "@/components/common/DocDrawer";
import EmptyParty from "@/components/common/EmptyParty";
import Err from "@/components/common/Err";
import Section from "@/components/common/Section";
import Filter from "@/components/Filter";
import Page from "@/components/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddVexRuleDialog from "@/components/vex-rules/AddVexRuleDialog";
import CelPlayground from "@/components/vex-rules/CelPlayground";
import VexExportDialog from "@/components/vex-rules/VexExportDialog";
import VexRuleRecommendationsTable from "@/components/vex-rules/VexRuleRecommendationsTable";
import VexRulesTable from "@/components/vex-rules/VexRulesTable";
import VexSourcesTable from "@/components/vex-rules/VexSourcesSection";
import { isVexSourceType, type VexSource } from "@/types/view/vexRules";
import VexUploadModal from "@/components/vex-rules/VexUploadModal";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useDecodedParams from "@/hooks/useDecodedParams";
import useFilter from "@/hooks/useFilter";
import useRouterQuery from "@/hooks/useRouterQuery";
import { toast } from "@/lib/toast";
import { uploadVex } from "@/services/scanUploadService";
import { useVexRules, useVexSources } from "@/hooks/useVexRules";
import { buildFilterSearchParams } from "@/utils/url";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FunctionComponent } from "react";
import useVexRuleRecommendations from "@/hooks/useVexRuleRecommendations";

const sourcesFilterOptions = [
  {
    label: "Type",
    value: "type",
    operators: [{ value: "is" }, { value: "is not" }],
    filterValues: [
      { value: "cyclonedx", label: "CycloneDX VEX" },
      { value: "csaf", label: "CSAF" },
      { value: "openvex", label: "OpenVEX" },
    ],
  },
  {
    label: "URL",
    value: "url",
    operators: [{ value: "ilike", label: "contains" }],
    filterValues: [],
  },
];

const recommendationFilterOptions = [
  {
    label: "Recommendation",
    value: "title",
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
  },
  {
    label: "Result",
    value: "event_type",
    operators: [{ value: "is" }, { value: "is not" }],
    filterValues: [
      { value: "accepted", label: "Accepted" },
      { value: "falsePositive", label: "False Positive" },
      { value: "reopened", label: "Reopened" },
    ],
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
      { value: "reopened", label: "Reopened" },
    ],
  },
];

const VexRulesPage: FunctionComponent = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

  const scope = { organization: organizationSlug, projectSlug, assetSlug };
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
  const recommendationsQuery =
    activeTab === "recommendations" ? query : defaultQuery;

  const {
    data: vexRulesResponse,
    error,
    isLoading,
    mutate,
  } = useVexRules(scope, rulesQuery);
  const vexRules = vexRulesResponse?.data ?? [];

  const handleVexUpload = async (params: { file: File }) => {
    try {
      await uploadVex(
        {
          assetName: `${organizationSlug}/${projectSlug}/${assetSlug}`,
          origin: "vex-upload",
        },
        await params.file.text(),
      );
    } catch (error) {
      toast.error("Failed to upload VEX file: " + String(error));
      throw error;
    }

    toast.success("VEX file uploaded successfully");
    mutate();
  };

  const {
    setRulePrefill,
    canSeeRecommendations,
    addRuleDialogOpen,
    rulePrefill,
    recommendationsResponse,
    isRecommendationsLoading,
    setAddRuleDialogOpen,
    createRuleFromRecommendation,
  } = useVexRuleRecommendations(recommendationsQuery);

  const openCreateDialog = (celExpression?: string) => {
    setRulePrefill(celExpression ? { celExpression } : undefined);
    setAddRuleDialogOpen(true);
  };

  const {
    data: vexSourcesResponse,
    isLoading: isVexSourcesLoading,
    mutate: mutateVexSources,
  } = useVexSources(scope, sourcesQuery);

  // The API already excludes references of type "unknown", so every returned
  // reference is a VEX source. This only narrows the type - it must not drop
  // rows, or `total` would no longer match the tab badge and the pagination.
  const vexSources = useMemo(
    () =>
      vexSourcesResponse && {
        ...vexSourcesResponse,
        data: vexSourcesResponse.data.filter((ref): ref is VexSource =>
          isVexSourceType(ref.type),
        ),
      },
    [vexSourcesResponse],
  );

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
          <CelPlayground scope={scope} onCreateRule={openCreateDialog} />
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
            {canSeeRecommendations && (
              <TabsTrigger
                data-testid="vex-rules-tab-recommendations"
                onClick={() => handleTabChange("recommendations")}
                value="recommendations"
              >
                Recommendations
                {!!recommendationsResponse?.total && (
                  <Badge variant="secondary" className="ml-2 font-medium">
                    {recommendationsResponse.total}
                  </Badge>
                )}
              </TabsTrigger>
            )}
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
                scope={scope}
                isLoading={isLoading}
                onMutate={() => mutate()}
              />
            )}
          </TabsContent>

          {canSeeRecommendations && (
            <TabsContent value="recommendations" className="mt-4">
              <p className="mb-4 text-sm leading-6 text-muted-foreground">
                Other users of DevGuard assessed vulnerabilities that are found
                in your repository already. Based on a majority vote, the
                following VEX rules are recommended. Nothing is applied until
                you create the rule. You can find the list of official upstream
                sources that devguard syncs{" "}
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
              <div className="mb-4 flex flex-row gap-2">
                <Filter
                  options={recommendationFilterOptions}
                  onFilter={handleFilter}
                  onRemoveFilter={removeFilter}
                  onClearAllFilters={clearAllFilters}
                  search={{
                    onChange: handleSearch,
                    defaultValue: searchParams?.get("search") ?? "",
                    placeholder:
                      "Search recommendations by title, justification, or CVE ID...",
                  }}
                />
              </div>
              {recommendationsResponse?.data.length === 0 &&
              !isRecommendationsLoading ? (
                <EmptyParty
                  title="No recommendations yet."
                  description="Recommendations appear once other DevGuard users or upstream sources have assessed vulnerabilities that also show up in this repository."
                />
              ) : (
                <VexRuleRecommendationsTable
                  recommendations={
                    recommendationsResponse ?? {
                      data: [],
                      total: 0,
                      page: 1,
                      pageSize: 25,
                    }
                  }
                  isLoading={isRecommendationsLoading}
                  onCreateRule={createRuleFromRecommendation}
                />
              )}
            </TabsContent>
          )}

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
              scope={scope}
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
        onSourceAdded={() => mutateVexSources()}
      />
      <AddVexRuleDialog
        open={addRuleDialogOpen}
        onOpenChange={setAddRuleDialogOpen}
        scope={scope}
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
