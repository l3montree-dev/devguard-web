import { VexRule } from "@/types/api/api";
import { FunctionComponent, useMemo, useState } from "react";
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
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import EcosystemImage from "@/components/common/EcosystemImage";
import { Badge } from "@/components/ui/badge";
import Section from "@/components/common/Section";
import DependencyGraph from "../DependencyGraph";
import { convertPathsToTree } from "../../utils/dependencyGraphHelpers";
import { useTheme } from "next-themes";
import ListItem from "../common/ListItem";

interface VexRuleDetailsDialogProps {
  vexRule: VexRule | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug?: string;
  projectSlug?: string;
  assetSlug?: string;
  assetVersionSlug?: string;
  deleteUrlBase?: string;
  onDeleted?: () => void;
}

const VexRuleDetailsDialog: FunctionComponent<VexRuleDetailsDialogProps> = ({
  vexRule,
  isOpen,
  onOpenChange,
  organizationSlug,
  projectSlug,
  assetSlug,
  assetVersionSlug,
  deleteUrlBase,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { theme } = useTheme();

  const graph = useMemo(() => {
    if (!vexRule?.pathPattern)
      return {
        name: "(*)",
        children: [],
        risk: 0,
        parents: [],
        nodeType: "component" as const,
      };

    const g = convertPathsToTree([vexRule.pathPattern], []);
    g.name = "(*)";
    return g;
  }, [vexRule?.pathPattern]);

  if (!vexRule) return null;

  const handleDelete = async () => {
    if (!deleteUrlBase) return;

    setIsDeleting(true);
    try {
      await browserApiClient(`${deleteUrlBase}/${vexRule.id}`, {
        method: "DELETE",
      });
      toast.success("VEX rule deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error("Failed to delete VEX rule");
    } finally {
      setIsDeleting(false);
    }
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
              className={classNames(
                "h-72 w-full rounded-lg border",
                theme === "light" ? "bg-gray-50" : "bg-black",
              )}
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
              Button={
                <Badge variant="outline" className="whitespace-nowrap">
                  {vexRule.vexSource}
                </Badge>
              }
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Rule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VexRuleDetailsDialog;
