// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import CodeEditor from "@/components/common/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { browserApiClient } from "@/services/devGuardApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { InputWithButton } from "../ui/input-with-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

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
            value={`index-url =${url}/simple`}
            nameKey="pypi-index-url"
            copyable
          />
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

  const [selectedProxyTab, setSelectedProxyTab] = useState("");
  const [checkPackage, setCheckPackage] = useState("");
  const [checkResult, setCheckResult] = useState<{
    allowed: boolean;
    status: number | null;
    reason?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const config = data ?? defaultConfig;
    setRulesText(config.rules);
    setMinReleaseTime(config.minReleaseTime);
  }, [data]);

  useEffect(() => {
    if (proxyUrls && !selectedProxyTab) {
      setSelectedProxyTab(Object.keys(proxyUrls)[0] ?? "");
    }
  }, [proxyUrls, selectedProxyTab]);

  const handleEditorValidation = (isValid: boolean, diagnostics: any[]) => {
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

  const handleCheck = async () => {
    if (!proxyUrls || !selectedProxyTab || !checkPackage.trim()) return;
    const proxyUrl = proxyUrls[selectedProxyTab];
    if (!proxyUrl) return;
    setIsChecking(true);
    setCheckResult(null);

    // Route through the Next.js tunnel to avoid CORS issues and get the real HTTP status
    const proxyPath = new URL(proxyUrl).pathname.replace(/\/$/, "");
    const checkUrl =
      "/api/devguard-tunnel" + proxyPath + "/" + checkPackage.trim();

    const resp = await fetch(checkUrl, { method: "GET" });

    let reason: string | undefined = undefined;
    if (resp.status === 403) {
      const body = await resp.json();
      reason = body.reason ?? body.message;
    }

    setCheckResult({ allowed: resp.ok, status: resp.status, reason });

    setIsChecking(false);
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proxy URLs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Tabs
              value={selectedProxyTab}
              onValueChange={(v) => {
                setSelectedProxyTab(v);
                setCheckResult(null);
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
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Test Package Rules</p>
                <div className="flex items-center gap-2">
                  <Input
                    variant="onCard"
                    placeholder="e.g. lodash"
                    value={checkPackage}
                    onChange={(e) => {
                      setCheckPackage(e.target.value);
                      setCheckResult(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    className="w-56"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheck}
                    disabled={isChecking || !checkPackage.trim()}
                  >
                    {isChecking ? "Checking..." : "Check"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sends a request to the{" "}
                  {selectedProxyTab ? selectedProxyTab.toUpperCase() : ""} proxy
                  registry to verify whether the package is allowed or blocked
                  by the current rules.
                </p>
              </div>
              {checkResult && (
                <div className="flex items-center gap-1.5 text-sm">
                  {checkResult.status === 200 ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-green-500">
                        This package is allowed by the current rules.
                      </span>
                    </>
                  ) : checkResult.status === 403 ? (
                    <>
                      <XCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
                      <span className="text-red-500">
                        {checkResult.reason ? (
                          <>Blocked: {checkResult.reason}</>
                        ) : (
                          "This package would be blocked by the current rules."
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
                      <span className="text-red-500">
                        Request failed (HTTP {checkResult.status}). Make sure
                        you have selected the correct proxy URL tab and that the
                        package exists in the chosen registry.
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base"> Blocked Package Rules </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Define rules for blocking packages using gitignore-style
                  patterns. Each line is one rule, applied top to bottom.
                </p>
                <button
                  type="button"
                  onClick={() => setRulesHelpOpen((v) => !v)}
                  className="ml-4 shrink-0 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  {rulesHelpOpen ? "Hide examples" : "Show examples"}
                </button>
              </div>
              {rulesHelpOpen && (
                <div className="mt-2 flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {[
                    {
                      pattern: "npm/lodash",
                      desc: "Blocks all versions of a package in a specific ecosystem.",
                      example:
                        "npm/lodash → blocks lodash@1.x, lodash@4.x, … in npm",
                    },
                    {
                      pattern: "npm/lodash@4.17.21",
                      desc: "Blocks exactly one specific version.",
                      example:
                        "npm/lodash@4.17.21 → only that version is blocked",
                    },
                    {
                      pattern: "npm/lodash@4.*",
                      desc: "Blocks all versions matching a version prefix.",
                      example:
                        "npm/lodash@4.* → blocks npm/lodash@4.0.0, npm/lodash@4.17.21, …",
                    },
                    {
                      pattern: "*/lodash",
                      desc: "Wildcard * matches any single path segment — blocks a package across all ecosystems.",
                      example: "*/lodash → matches npm/lodash and go/lodash",
                    },
                    {
                      pattern: "npm/*/lodash",
                      desc: "Wildcards can be combined to match specific patterns.",
                      example:
                        "npm/*/lodash → matches npm/frontend/lodash but not npm/lodash or go/lodash",
                    },
                    {
                      pattern: "npm/**/lodash",
                      desc: "Double wildcard ** matches any number of path segments.",
                      example:
                        "npm/**/lodash → matches npm/lodash, npm/frontend/lodash, npm/a/b/lodash, …",
                    },
                    {
                      pattern: "**/next",
                      desc: "Double wildcard ** matches any number of path segments.",
                      example:
                        "**/next → matches npm/next, npm/example/next, npm/a/b/next, …",
                    },
                    {
                      pattern: "*",
                      desc: "Blocks every package in every ecosystem.",
                      example: "* → all packages are blocked",
                    },
                    {
                      pattern: "!*/lodash",
                      desc: "Negation with ! allows a package even if a previous rule blocked it.",
                      example:
                        "* then !*/lodash → everything blocked except lodash",
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
            </div>
            <CodeEditor
              value={rulesText}
              language="pkg"
              onChange={setRulesText}
              onValidation={handleEditorValidation}
            />
            {codeError && (
              <p className="text-sm text-destructive">{codeError}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cooldown Period</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Minimum time in hours that a package must be idle before the proxy
              serves it. This helps to ensure that only stable packages are
              proxied.
            </p>
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
          </CardContent>
        </Card>
        <div className="sticky bottom-0 flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving || !!codeError}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DependencyProxyConfigs;
