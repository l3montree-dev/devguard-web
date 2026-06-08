// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import CodeEditor from "@/components/common/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { browserApiClient } from "@/services/devGuardApi";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { InputWithButton } from "../ui/input-with-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Diagnostic } from "@codemirror/lint";
import Section from "./Section";
import { CopyCodeFragment } from "./CopyCode";
import Callout from "./Callout";
import { DocDrawer } from "./DocDrawer";

function matchPattern(pattern: string, packagePurl: string): boolean {
  const parts = pattern.split("*");
  if (parts.length === 1) {
    return packagePurl === pattern;
  }
  if (parts[0] !== "" && !packagePurl.startsWith(parts[0])) {
    return false;
  }
  if (
    parts[parts.length - 1] !== "" &&
    !packagePurl.endsWith(parts[parts.length - 1])
  ) {
    return false;
  }
  let rest = packagePurl;
  for (const part of parts) {
    if (part === "") continue;
    const idx = rest.indexOf(part);
    if (idx === -1) return false;
    rest = rest.slice(idx + part.length);
  }
  return true;
}

interface CheckResult {
  packagePurl: string;
  blocked: boolean;
  matchedRule: string;
}

function checkRulesAgainstPackages(
  rulesText: string,
  checkerRulesText: string,
): CheckResult[] {
  const rules = rulesText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));

  const packages = checkerRulesText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));

  return packages.map((packagePurl) => {
    let blocked = false;
    let matchedRule = "";

    for (const rule of rules) {
      const negate = rule.startsWith("!");
      const pattern = negate ? rule.slice(1) : rule;
      const matched = matchPattern(pattern, packagePurl);
      if (matched) {
        blocked = !negate;
        matchedRule = rule;
      }
    }

    return { packagePurl, blocked, matchedRule };
  });
}

interface DependencyProxyConfig {
  rules: string;
  minReleaseTime: number;
}

const defaultConfig: DependencyProxyConfig = {
  rules: "",
  minReleaseTime: 60,
};

const getEcosystemContent = (key: string, url: string) => {
  switch (key) {
    case "npm":
      return (
        <InputWithButton
          label="npm Registry URL"
          message="Create a .npmrc file in your project root with this content to enable proxying for npm packages."
          value={`registry=${url}`}
          nameKey="npm-proxy-url"
          copyable
        />
      );

    case "go":
      return (
        <InputWithButton
          label="Go Module Proxy"
          message="Set this environment variable or add it to your shell profile (.bashrc, .zshrc) to route Go module downloads through the dependency proxy."
          value={`export GOPROXY="${url}"`}
          nameKey="go-proxy-url"
          copyable
        />
      );

    case "pypi": {
      return (
        <div className="flex flex-col">
          <InputWithButton
            label="Index URL"
            message="Set as index-url in pip.conf under [global], or export as PIP_INDEX_URL."
            value={`index-url = ${url}`}
            nameKey="pypi-index-url"
            copyable
          />
        </div>
      );
    }
    case "oci": {
      return (
        <div>
          <InputWithButton
            label="OCI Image Proxy URL"
            message="Use this URL as the registry endpoint in your container image pull configuration to route image pulls through the dependency proxy."
            value={url}
            nameKey="oci-proxy-url"
            copyable
          />
          <p className="my-4 text-sm">
            <span className="font-medium mb-1 block">Example</span>
            <CopyCodeFragment
              codeString={`docker pull ${url}/docker.io/library/nginx:latest`}
            />
          </p>
          <Callout intent="warning">
            You need to provide the full original registry and image path after
            the proxy URL. For example, if you want to pull nginx:latest from
            Docker Hub, you need to use the URL{" "}
            <code className="font-mono text-sm">
              {url}/docker.io/library/nginx:latest
            </code>{" "}
            instead of just{" "}
            <code className="font-mono text-sm">{url}/nginx:latest</code>.
          </Callout>
        </div>
      );
    }

    default:
      return (
        <InputWithButton
          label={`${key.toUpperCase()} Proxy URL`}
          message="Copy this URL to configure your package manager to use the dependency proxy."
          value={url}
          nameKey={`${key}-proxy-url`}
          copyable
        />
      );
  }
};

interface Props {
  baseUrl: string | null;
}

const DependencyProxyConfigs = ({ baseUrl }: Props) => {
  const configUrl = baseUrl
    ? baseUrl + "/config-files/dependency-proxy-configs"
    : null;

  const { data, mutate } = useSWR<DependencyProxyConfig | null>(
    configUrl,
    async (url: string) => {
      const response = await browserApiClient(url);
      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error("Failed to fetch dependency proxy settings");
      return response.json();
    },
  );

  //get the proxy urls
  const { data: proxyUrls } = useSWR<Record<string, string>>(
    baseUrl ? baseUrl + "/dependency-proxy-urls" : null,
    async (url: string) => {
      const response = await browserApiClient(url);
      if (!response.ok) throw new Error("Failed to fetch proxy urls");
      return response.json();
    },
  );

  const [rulesText, setRulesText] = useState("");
  const [minReleaseTime, setMinReleaseTime] = useState(
    defaultConfig.minReleaseTime,
  );
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rulesHelpOpen, setRulesHelpOpen] = useState(false);
  const [rulesCheckerOpen, setRulesCheckerOpen] = useState(false);
  const initializedForUrl = useRef<string | null | undefined>(undefined);

  const [selectedProxyTab, setSelectedProxyTab] = useState("");

  const [checkerRulesText, setCheckerRulesText] = useState(
    "# Example package URLs to test against the rules: \n" +
      "# You can add new ones or modify these to test your rules.\n" +
      "\n" +
      "pkg:pypi/requests@2.25.1" +
      "\n" +
      "pkg:npm/lodash@4.17.21" +
      "\n" +
      "pkg:go/github.com/lodash/lodash@v1.0.0",
  );
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

  useEffect(() => {
    if (checkerRulesText.trim()) {
      setCheckResults(checkRulesAgainstPackages(rulesText, checkerRulesText));
    } else {
      setCheckResults([]);
    }
  }, [rulesText, checkerRulesText]);

  useEffect(() => {
    if (data !== undefined && initializedForUrl.current !== configUrl) {
      const config = data ?? defaultConfig;
      setRulesText(config.rules);
      setMinReleaseTime(config.minReleaseTime);
      initializedForUrl.current = configUrl;
    }
  }, [data, configUrl]);

  useEffect(() => {
    if (proxyUrls && !selectedProxyTab) {
      setSelectedProxyTab(Object.keys(proxyUrls)[0] ?? "");
    }
  }, [proxyUrls, selectedProxyTab]);

  const handleEditorValidation = (
    isValid: boolean,
    diagnostics: Diagnostic[],
  ) => {
    if (isValid) {
      setCodeError(null);
    } else {
      if (diagnostics.length > 0) {
        setCodeError(
          diagnostics[0].message || "Invalid package rules configuration",
        );
      }
    }
  };

  const handleSave = async () => {
    if (!configUrl) return;
    const config: DependencyProxyConfig = {
      rules: rulesText,
      minReleaseTime: minReleaseTime,
    };
    setIsSaving(true);
    const resp = await browserApiClient(configUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setIsSaving(false);
    if (!resp.ok) {
      setCodeError("Failed to save dependency proxy settings");
      toast.error("Failed to save dependency proxy settings");
      return;
    }
    setCodeError(null);
    toast.success("Settings saved");
    mutate(config);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <DocDrawer
            triggerLabel="Learn how the Dependency Proxy works"
            drawerTitle="Dependency Proxy"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/how-to-guides/security/dependency-proxy.mdx"
            docsUrl="https://docs.devguard.org/how-to-guides/security/dependency-proxy/"
          />
        </div>
        <Section
          title="Dependency Proxy URLs"
          description="Configure your package manager to use the dependency proxy by using the URLs below. Click on each URL for specific configuration instructions for different ecosystems."
        >
          <div className="border rounded-md p-4">
            <Tabs
              value={selectedProxyTab}
              onValueChange={(v) => {
                setSelectedProxyTab(v);
              }}
            >
              <TabsList>
                {proxyUrls &&
                  Object.keys(proxyUrls).map((key) => (
                    <TabsTrigger key={key} value={key}>
                      {key}
                    </TabsTrigger>
                  ))}
              </TabsList>
              {proxyUrls &&
                Object.entries(proxyUrls).map(([key, url]) => (
                  <TabsContent key={key} value={key}>
                    {getEcosystemContent(key, url)}
                  </TabsContent>
                ))}
            </Tabs>
          </div>
        </Section>
        <Section
          description="Define rules for blocking packages using gitignore-style patterns. Each line is one rule, applied top to bottom."
          title="Blocked Packages Rules"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground"></p>
              <div>
                <button
                  type="button"
                  onClick={() => setRulesHelpOpen((v) => !v)}
                  className="ml-4 shrink-0 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  {rulesHelpOpen ? "Hide examples" : "Show examples"}
                </button>
                <button
                  type="button"
                  onClick={() => setRulesCheckerOpen((v) => !v)}
                  className="ml-4 shrink-0 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  {rulesCheckerOpen ? "Hide tester" : "Test your rules"}
                </button>
              </div>
            </div>
            {rulesHelpOpen && (
              <div className="mt-2 flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                {[
                  {
                    pattern: "npm/lodash@1.17.21",
                    desc: "Blocks exactly one specific version.",
                    example:
                      "npm/lodash@4.17.21 → only that version is blocked",
                  },
                  {
                    pattern: "npm/lodash*",
                    desc: "Blocks all versions matching a prefix.",
                    example:
                      "npm/lodash* → blocks npm/lodash@4.17.21, npm/lodash@5.0.0, …",
                  },
                  {
                    pattern: "npm/lodash@4.*",
                    desc: "Blocks all versions matching a version prefix.",
                    example:
                      "npm/lodash@4.* → blocks npm/lodash@4.0.0, npm/lodash@4.17.21, …",
                  },
                  {
                    pattern: "*lodash*",
                    desc: "Blocks any package with lodash in its name, regardless of ecosystem or version.",
                    example:
                      "*lodash* → matches npm/lodash@4.17.21, go/lodash@v1.0.0, …",
                  },
                  {
                    pattern: "npm*lodash@1.17.21",
                    desc: "Wildcards can be combined to match specific patterns.",
                    example:
                      "npm*lodash → matches npm/frontend/lodash@4.17.21 but not go/lodash@v1.17.21",
                  },
                  {
                    pattern: "*",
                    desc: "Blocks every package in every ecosystem.",
                    example: "* → all packages are blocked",
                  },
                  {
                    pattern: "!*lodash*",
                    desc: "Negation with ! allows a package even if a previous rule blocked it.",
                    example:
                      "* then !*lodash* → everything blocked except lodash",
                  },
                  {
                    pattern: "!*",
                    desc: "Allows every package — overrides all previous block rules.",
                    example: "* then !* → nothing is blocked in the end",
                  },
                  {
                    pattern: "# comment",
                    desc: "Lines starting with # are ignored.",
                    example: "# block dangerous packages",
                  },
                ].map(({ pattern, desc, example }) => (
                  <div key={pattern} className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                        {pattern}
                      </code>
                      <span>{desc}</span>
                    </div>
                    <span className="pl-1 text-muted-foreground/70">
                      e.g. <code className="font-mono">{example}</code>
                    </span>
                  </div>
                ))}
              </div>
            )}
            {rulesCheckerOpen && (
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="mb-1 text-sm text-muted-foreground">
                  Test your rules by entering package URLs (one per line) in the
                  box below.
                </p>
                <CodeEditor
                  value={checkerRulesText}
                  language="purl"
                  onChange={setCheckerRulesText}
                />

                {checkResults.length > 0 && (
                  <div className="rounded-md border bg-muted/40 p-2 font-mono text-xs">
                    {checkResults.map(
                      ({ packagePurl, blocked, matchedRule }) => (
                        <div
                          key={packagePurl}
                          className={
                            blocked ? "text-destructive" : "text-success"
                          }
                        >
                          {packagePurl}
                          {matchedRule && (
                            <span className="opacity-60">
                              {" # "}
                              {blocked ? "blocked" : "allowed"} by &quot;
                              {matchedRule}&quot;
                            </span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 md:flex-row pb-6">
            <div className="min-w-0 flex-1">
              <div>
                <p className="mb-1 text-sm font-medium">
                  Enter your dependency proxy rules below:
                </p>
              </div>
              <CodeEditor
                value={rulesText}
                language="dependencyProxyRule"
                onChange={setRulesText}
                onValidation={handleEditorValidation}
                onSave={
                  codeError ||
                  isSaving ||
                  (rulesText === (data ?? defaultConfig).rules &&
                    minReleaseTime ===
                      (data ?? defaultConfig).minReleaseTime) ||
                  data === undefined
                    ? undefined
                    : handleSave
                }
              />
            </div>
          </div>
          {codeError && <p className="text-sm text-destructive">{codeError}</p>}
        </Section>
        <Section
          title="Cooldown Period"
          description="Set a cooldown period in hours that enforces a minimum time between when a new package version is released and when it can be downloaded through the proxy. "
        >
          <div>
            <span className="text-sm mb-2 block font-medium">
              Minimum release age
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                variant="onCard"
                className="w-24"
                value={minReleaseTime}
                onChange={(e) => setMinReleaseTime(Number(e.target.value))}
              />
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                hours
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              In major supply chain incidents—such as the 2026 axios
              compromise—malicious versions were identified and marked as
              deprecated within a few hours. Deprecation is a common
              registry-level mitigation used to discourage further installs.
            </p>
          </div>
        </Section>
        <div className="sticky bottom-0 flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              data === undefined ||
              !!codeError ||
              (rulesText === (data ?? defaultConfig).rules &&
                minReleaseTime === (data ?? defaultConfig).minReleaseTime)
            }
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DependencyProxyConfigs;
