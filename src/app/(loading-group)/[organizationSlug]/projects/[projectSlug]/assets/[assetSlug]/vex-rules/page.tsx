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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
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
import VexSourcesSection from "@/components/vex-rules/VexSourcesSection";
import { useVexSources } from "@/components/vex-rules/useVexSources";
import VexUploadModal from "@/components/vex-rules/VexUploadModal";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { ChevronDown } from "lucide-react";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { Paged, VexRule, VexRulePrefill } from "@/types/api/api";
import { buildFilterSearchParams } from "@/utils/url";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FunctionComponent } from "react";
import useSWR from "swr";
import Link from "next/link";

const VexRulesPage: FunctionComponent = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false);
  const [rulePrefill, setRulePrefill] = useState<VexRulePrefill>();

  const searchParams = useSearchParams();
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

  const {
    data: vexRulesResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<Paged<VexRule>>(`${vexRulesUrl}/?${query.toString()}`, fetcher);
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

  const { sources: vexSources } = useVexSources();

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

      <Section
        forceVertical
        title="Active VEX rules"
        description="Every rule currently applied to this repository - your own and the ones synced from upstream sources."
        className="mb-6 border-t pt-6"
      >
        {vexRules.length === 0 ? (
          <EmptyParty
            title="No VEX rules found."
            description="VEX rules define how vulnerabilities are handled based on their context. Try an expression in the playground above to create your first rule, or sync one from an upstream source."
          />
        ) : (
          <VexRulesTable
            rules={vexRules}
            urlBase={vexRulesUrl}
            isLoading={isLoading}
            onMutate={() => mutate()}
          />
        )}
      </Section>

      <AuthGuard require="member">
        {recommendations.length > 0 && (
          <Section
            forceVertical
            title="Recommendations based on your organisation assessments, upstream sources and other DevGuard users"
            description={
              <>
                Other users of DevGuard assessed vulnerabilities that are found
                in your Reposiotory already. Based on a majority vote, the
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
              </>
            }
            className="mb-6 border-t pt-6"
          >
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
          </Section>
        )}
      </AuthGuard>

      <Collapsible className="mb-6 border-t pt-6">
        <CollapsibleTrigger
          data-testid="upstream-vex-sources-trigger"
          className="group flex w-full cursor-pointer flex-row items-center justify-between"
        >
          <span className="flex flex-row items-center gap-2 text-base font-semibold leading-7 text-foreground">
            Your additional Upstream VEX sources
            {vexSources.length > 0 && (
              <Badge variant="secondary" className="font-medium">
                {vexSources.length}
              </Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            URLs, usually provided by your suppliers, that carry VEX data for
            the components you use. Syncing a source creates the rules listed
            above.
          </p>
          <VexSourcesSection onAddSource={() => setUploadDialogOpen(true)} />
        </CollapsibleContent>
      </Collapsible>

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
