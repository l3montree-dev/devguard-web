// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import {
  ASSET_VERSION_COMPLETIONS,
  checkCelSyntax,
  REF_FIELDS,
} from "@/components/common/celLinter";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { useRetentionPolicyTest } from "@/hooks/useRetentionPolicyTest";
import { toast } from "@/lib/toast";
import { classNames } from "@/utils/common";
import { ChevronDown, Info, RotateCcw } from "lucide-react";
import { useState } from "react";
import RetentionPolicyPreview from "./RetentionPolicyPreview";

// Mirrors celrules.DefaultAssetVersionRetentionPolicy character for character - the
// server returns it after a reset, and it is compared against to detect the default.
const DEFAULT_POLICY =
  'ref.type == "tag" || ref.defaultBranch || timestamp(ref.createdAt) > now() - duration("168h") || (has(ref.lastUploadAt) && timestamp(ref.lastUploadAt) > now() - duration("168h"))';

// The backend protects nothing on its own - every example keeps the default branch
// and gives new refs a grace period, so a branch is not deleted before its first upload.
const GRACE_PERIOD_COMMENT =
  "// never delete the default branch or refs created in the last 7 days";
const GRACE_PERIOD =
  'ref.defaultBranch || timestamp(ref.createdAt) > now() - duration("168h")';

// Branches are kept like the default policy does it, tags are up to the example.
const DEFAULT_BRANCH_RULE = `// branches: the default branch and branches created or uploaded to in the last 7 days
ref.type == "branch"
  ? ${GRACE_PERIOD}
    || (has(ref.lastUploadAt) && timestamp(ref.lastUploadAt) > now() - duration("168h"))`;

// The policies people usually want, one click away.
const EXAMPLES: Array<{ label: string; expression: string }> = [
  {
    label:
      "Default: tags + default branch + branches created or uploaded to in the last 7 days",
    expression: DEFAULT_POLICY,
  },
  {
    label: "Tags + branches created or uploaded to in the last 30 days",
    expression:
      'ref.type == "tag" || ref.defaultBranch || timestamp(ref.createdAt) > now() - duration("720h") || (has(ref.lastUploadAt) && timestamp(ref.lastUploadAt) > now() - duration("720h"))',
  },

  {
    label: "Tags + release branches",
    expression: `${GRACE_PERIOD_COMMENT}
ref.type == "tag" || ${GRACE_PERIOD}
  || ref.name.startsWith("release/") || ref.name == "develop"`,
  },
  {
    label: "Only the 5 newest tags",
    expression: `${DEFAULT_BRANCH_RULE}
// tags: keep a tag if fewer than 5 other tags were created after it
  : otherRefs
    .filter(other, other.type == "tag" && timestamp(other.createdAt) > timestamp(ref.createdAt))
    .size() < 5`,
  },
  {
    label: "Only the latest semver tag",
    expression: `${DEFAULT_BRANCH_RULE}
// tags: keep only the highest semantic version
  : ref.isLatest`,
  },
  {
    label: "Tags of the current major version",
    expression: `${DEFAULT_BRANCH_RULE}
// tags: keep every tag sharing the major version of the latest tag
  : has(ref.latestRef) && isSemver(ref.name)
    && semver(ref.name).major == semver(ref.latestRef.name).major`,
  },
  {
    label: "Latest patch of each minor version",
    expression: `${DEFAULT_BRANCH_RULE}
// tags: keep the highest patch of every major.minor
  : isSemver(ref.name) && otherRefs
    .filter(other, other.type == "tag" && isSemver(other.name)
      && semver(other.name).major == semver(ref.name).major
      && semver(other.name).minor == semver(ref.name).minor)
    .all(other, semver(ref.name) >= semver(other.name))`,
  },
  {
    label: "Latest patch of the last 3 minor versions",
    expression: `${DEFAULT_BRANCH_RULE}
// tags: keep the highest patch of its major.minor...
  : isSemver(ref.name) && otherRefs
    .filter(other, other.type == "tag" && isSemver(other.name)
      && semver(other.name).major == semver(ref.name).major
      && semver(other.name).minor == semver(ref.name).minor)
    .all(other, semver(ref.name) >= semver(other.name))
// ...if fewer than 3 newer minor versions exist - each counted once, by its highest patch
  && otherRefs
    .filter(other, other.type == "tag" && isSemver(other.name)
      && (semver(other.name).major > semver(ref.name).major
        || (semver(other.name).major == semver(ref.name).major
          && semver(other.name).minor > semver(ref.name).minor))
      && otherRefs
        .filter(o, o.type == "tag" && isSemver(o.name)
          && semver(o.name).major == semver(other.name).major
          && semver(o.name).minor == semver(other.name).minor)
        .all(o, semver(other.name) >= semver(o.name)))
    .size() < 3`,
  },
];

const OTHER_VARIABLES = [
  {
    label: "otherRefs",
    detail: "list<map>",
    info: "All other branches and tags, each with the same fields as ref",
  },
  {
    label: "now()",
    detail: "timestamp",
    info: 'The current time, compare with timestamp(...) and duration("24h")',
  },
  {
    label: "semver(s), isSemver(s)",
    detail: "semver, bool",
    info: "Parse and compare semantic versions, fields major, minor, patch, prerelease",
  },
  {
    label: "has(field)",
    detail: "bool",
    info: "Whether a field is present, e.g. has(ref.lastUploadAt) before reading it",
  },
];

const AssetVersionRetentionSettings = () => {
  const asset = useActiveAsset()!;
  const handleUpdate = useAssetUpdate();
  const saved = asset.assetVersionRetentionPolicy || DEFAULT_POLICY;
  const [policy, setPolicy] = useState(saved);

  const isEmpty = policy.trim() === "";
  const syntaxError = isEmpty
    ? null
    : checkCelSyntax(policy, ASSET_VERSION_COMPLETIONS);
  // an empty policy resets to the default, so that is what gets previewed
  const test = useRetentionPolicyTest(isEmpty ? DEFAULT_POLICY : policy);
  // the server compiles with cel-go and catches what the editor's linter cannot
  const canSave = policy !== saved && !syntaxError && !test.error;

  const save = async (value: string) => {
    try {
      // an empty policy resets to the default on the server
      await handleUpdate({ assetVersionRetentionPolicy: value.trim() });
      setPolicy(value.trim() === "" ? DEFAULT_POLICY : value.trim());
    } catch {
      toast.error("Could not save the retention policy", {
        description:
          "The server rejected the expression. Check the field names and functions used.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          The expression is evaluated for every branch and tag (
          <code className="font-mono text-foreground">ref</code>). Return{" "}
          <code className="font-mono text-foreground">true</code> to keep it;{" "}
          <code className="font-mono text-foreground">false</code> deletes it
          together with its findings. Nothing is protected automatically: keep{" "}
          <code className="font-mono text-foreground">ref.defaultBranch</code>{" "}
          and recently created refs in your expression, or a new branch may be
          deleted before its first upload. Only refs the expression fails to
          evaluate for are always kept.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Start from an example</span>
        <div className="flex flex-row flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button
              key={example.label}
              type="button"
              variant={policy === example.expression ? "secondary" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPolicy(example.expression)}
            >
              {example.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <CelCodeBlock
          value={policy}
          language="cel-asset-version"
          placeholder={DEFAULT_POLICY}
          onChange={setPolicy}
          onSave={() => canSave && save(policy)}
        />
        {syntaxError ? (
          <span className="text-xs text-destructive">
            {syntaxError.message}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Type <code className="font-mono">ref.</code> for suggestions.
            Leaving the expression empty resets it to the default.
          </span>
        )}
      </div>

      <RetentionPolicyPreview
        isTesting={test.isTesting}
        result={test.result}
        error={test.error}
      />

      <Collapsible>
        <CollapsibleTrigger className="group flex flex-row items-center gap-1 text-sm font-medium">
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]:-rotate-90" />
          Available fields and functions
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 overflow-hidden rounded-lg border">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-card text-foreground">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...REF_FIELDS.map((field) => ({
                      label: `ref.${field.label}`,
                      detail: field.detail,
                      info: typeof field.info === "string" ? field.info : null,
                    })),
                    ...OTHER_VARIABLES,
                  ].map((row, i) => (
                    <tr
                      key={row.label}
                      className={classNames(
                        "border-b last:border-b-0",
                        i % 2 !== 0 && "bg-card/50",
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-2 font-mono">
                        {row.label}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-muted-foreground">
                        {row.detail}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {row.info}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-row flex-wrap items-center justify-end gap-2">
        {policy !== saved &&
          !test.isTesting &&
          test.result &&
          test.result.toDelete.length > 0 && (
            <span className="mr-auto text-sm text-destructive">
              Saving deletes {test.result.toDelete.length} branches and tags
              with the next background run.
            </span>
          )}
        {saved !== DEFAULT_POLICY && (
          <AsyncButton type="button" variant="outline" onClick={() => save("")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to default
          </AsyncButton>
        )}
        {policy !== saved && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPolicy(saved)}
          >
            Discard changes
          </Button>
        )}
        <AsyncButton
          type="button"
          disabled={!canSave}
          onClick={() => save(policy)}
        >
          Save
        </AsyncButton>
      </div>
    </div>
  );
};

export default AssetVersionRetentionSettings;
