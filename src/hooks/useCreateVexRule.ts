import { useCallback } from "react";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import { VexSelection } from "@/components/DependencyGraph";

interface UseCreateParams {
  activeOrgSlug: string;
  projectSlug: string;
  assetSlug: string;
  assetVersionSlug: string;
  // vulnerability cve id
  cveId?: string | null;
  // mutate function to refresh vuln after creation
  mutate: () => Promise<any> | null;
}

// Returns an async handler that accepts the VEX selection and creates a false positive rule
export function useCreateVexRule({
  activeOrgSlug,
  projectSlug,
  assetSlug,
  assetVersionSlug,
  cveId,
  mutate,
}: UseCreateParams) {
  return useCallback(
    async (selection: VexSelection) => {
      // map VEX keys to mechanical justification
      const mechMap: Record<string, string> = {
        not_present: "component_not_present",
        no_vulnerable_code: "vulnerable_code_not_present",
        does_not_call_vulnerable_function:
          "vulnerable_code_not_in_execute_path",
        inline_mitigations: "inline_mitigations_already_exist",
        uncontrollable_by_attacker:
          "vulnerable_code_cannot_be_controlled_by_adversary",
      };

      const labelMap: Record<string, string> = {
        not_present: "Not Present",
        no_vulnerable_code: "No Vulnerable Code",
        does_not_call_vulnerable_function: "Does Not Call Vulnerable Function",
        inline_mitigations: "Inline Mitigations",
        uncontrollable_by_attacker: "Uncontrollable by Attacker",
      };

      let pathPattern: string[] | undefined;
      if (selection.type === "node" && selection.nodeName) {
        pathPattern = [selection.nodeName, "*"];
      } else if (selection.type === "edge" && selection.childName) {
        pathPattern = [selection.childName, "*"];
      } else if (selection.type === "edge" && selection.parentName) {
        pathPattern = [selection.parentName, "*"];
      }

      if (!pathPattern || !cveId) {
        toast("Could not determine path for rule");
        return false;
      }

      const mechanicalJustification = mechMap[selection.justification];
      const label =
        labelMap[selection.justification] ?? selection.justification;
      const justificationText = `Marked as false positive via dependency graph: ${label}`;

      try {
        const url = `/organizations/${activeOrgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/vex-rules`;
        const resp = await browserApiClient(url, {
          method: "POST",
          body: JSON.stringify({
            cveId,
            justification: justificationText,
            mechanicalJustification: mechanicalJustification ?? "",
            pathPattern,
          }),
        });

        if (!resp.ok) {
          const body = await resp.text().catch(() => "");
          toast("Failed to create VEX rule", {
            description: body ?? "",
          });
          return false;
        }

        // optionally refresh state
        try {
          await mutate?.();
        } catch (e) {
          // ignore mutate errors
        }

        toast("VEX rule created", {
          description: "The rule will apply to matching vulnerabilities.",
        });
        return true;
      } catch (err) {
        toast("Failed to create VEX rule", {
          description: "Please try again later.",
        });
        return false;
      }
    },
    [activeOrgSlug, projectSlug, assetSlug, cveId, mutate],
  );
}
