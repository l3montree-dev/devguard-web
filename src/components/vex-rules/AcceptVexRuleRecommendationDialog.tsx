import type { VexRule } from "@/types/api/api";
import { useMemo, useState } from "react";
import type { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VexRuleResult from "./VexRuleResult";
import VexHasEffectBadge from "./VexHasEffectBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Section from "@/components/common/Section";
import DependencyGraph from "../DependencyGraph";
import { convertPathsToTree } from "../../utils/dependencyGraphHelpers";
import ListItem from "../common/ListItem";

interface AcceptVexRuleRecommendationDialogProps {
  vexRule: VexRule | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug?: string;
  projectSlug?: string;
  assetSlug?: string;
  assetVersionSlug?: string;
  urlBase?: string;
  onAccepted?: () => void;
}

const AcceptVexRuleRecommendationDialog: FunctionComponent<
  AcceptVexRuleRecommendationDialogProps
> = ({
  vexRule,
  isOpen,
  onOpenChange,
  organizationSlug,
  projectSlug,
  assetSlug,
  assetVersionSlug,
  urlBase: deleteUrlBase,
  onAccepted,
}) => {
  const [isAcceptingRecommendation, setIsAcceptingRecommendation] =
    useState(false);

  const graph = useMemo(() => {
    if (!vexRule?.pathPattern)
      return {
        id: "(*)",
        name: "(*)",
        children: [],
        risk: 0,
        parents: [],
        nodeType: "component" as const,
      };

    const g = convertPathsToTree([vexRule.pathPattern], [], false);

    return g;
  }, [vexRule?.pathPattern]);

  if (!vexRule) return null;

  const handleAcceptRecommendation = async () => {
    if (!deleteUrlBase) return;

    setIsAcceptingRecommendation(true);

    const resp = await browserApiClient(
      deleteUrlBase,
      {
        method: "POST",
        body: JSON.stringify({
          cveId: vexRule.cveId,
          justification: vexRule.justification ?? "",
          mechanicalJustification: vexRule.mechanicalJustification ?? "",
          pathPattern: vexRule.pathPattern,
        }),
      },
    );
    if (!resp.ok) {
      toast.error("Failed to reapply VEX rule");
    } else {
      toast.success("VEX rule recommendation applied succesfully");
      onAccepted?.();
    }
    setIsAcceptingRecommendation(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>VEX Rule Details</DialogTitle>
          <DialogDescription>
            View and manage the details of this VEX rule
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Path Pattern */}
          <Section
            className="mb-0"
            title="Path Pattern"
            description={
              <p>
                The dependency path where this rule applies. The wildcard * will
                match any component (Zero or more).{" "}
                <Link href="https://devguard.org/explanations/vulnerability-management/mitigation-strategies#vex-rules-automating-mitigation-at-scale">
                  Checkout the documentation for path patterns
                </Link>
              </p>
            }
            forceVertical
          >
            <div
              className={
                "h-72 w-full rounded-lg border bg-gray-50 dark:bg-black"
              }
            >
              <DependencyGraph
                variant="compact"
                width={100}
                height={200}
                vulns={[]}
                graph={graph}
              />
            </div>
          </Section>

          {/* Justification */}
          {vexRule.justification && (
            <Section
              className="mb-0"
              title="Justification"
              description="The reason why this vulnerability is not applicable or can be accepted. This is usually provided by the vulnerability management team or the rule source."
              forceVertical
            >
              <div className="bg-card/50 p-3 rounded-md text-sm border whitespace-pre-wrap break-words">
                {vexRule.justification}
              </div>
            </Section>
          )}
          {/* CVE ID */}
          <ListItem
            Title="CVE ID"
            Description="The Common Vulnerabilities and Exposures identifier"
            Button={
              organizationSlug &&
              projectSlug &&
              assetSlug &&
              assetVersionSlug ? (
                <Link
                  href={`/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/dependency-risks?search=${encodeURIComponent(vexRule.cveId)}&state=closed`}
                  className="whitespace-nowrap text-primary text-sm hover:underline"
                >
                  {vexRule.cveId}
                </Link>
              ) : null
            }
          />
          {/* Mechanical Justification */}
          {vexRule.mechanicalJustification && (
            <Section
              title="Mechanical Justification"
              description="Additional technical justification provided by the rule source"
              forceVertical
            >
              <div className="bg-card/50 p-3 rounded-md border whitespace-pre-wrap break-words">
                {vexRule.mechanicalJustification}
              </div>
            </Section>
          )}

          {/* VEX Source */}
          {vexRule.vexSource && (
            <ListItem
              Title="VEX Source"
              Description="The source or document that defines this VEX rule"
              Button={<Badge variant="outline">{vexRule.vexSource}</Badge>}
            />
          )}

          {/* Rule Result */}
          <ListItem
            Title="Rule Result"
            Description="The outcome of this rule when applied to vulnerabilities"
            Button={
              <VexRuleResult
                eventType={vexRule.eventType}
                mechanicalJustification={vexRule.mechanicalJustification}
              />
            }
          ></ListItem>

          {/* Has Effect */}
          <ListItem
            Title="Has Effect"
            Description="Number of dependency vulnerabilities affected by this rule"
            Button={
              <VexHasEffectBadge
                effectCount={vexRule.appliesToAmountOfDependencyVulns}
              />
            }
          ></ListItem>
        </div>

        <DialogFooter className="mt-10">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {deleteUrlBase && (
            <>
              <Button
                onClick={handleAcceptRecommendation}
                disabled={isAcceptingRecommendation}
                className="gap-2"
              >
                {isAcceptingRecommendation && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Apply Recommendation
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptVexRuleRecommendationDialog;
