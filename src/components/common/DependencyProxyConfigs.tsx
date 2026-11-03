// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import CodeEditor from "@/components/common/CodeEditor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProxyScope } from "@/hooks/useDependencyProxy";
import { useDependencyProxy } from "@/hooks/useDependencyProxy";
import { toast } from "@/lib/toast";
import { InputWithButton } from "../ui/input-with-button";
import type { Diagnostic } from "@codemirror/lint";
import Section from "./Section";
import CopyCode, { CopyCodeFragment } from "./CopyCode";
import Callout from "./Callout";
import { DocDrawer } from "./DocDrawer";
import { DelayedDownloadButton } from "./DelayedDownloadButton";
import { DownloadIcon } from "lucide-react";

const defaultConfig = `rules:
  - name: min-release-age
    action: deny
    # OCI images have no release time to check here
    expr: pkg.ecosystem != "oci" && now() - timestamp(pkg.releasedAt) < duration("120h")
# registries:
#   npm: https://nexus.example.com/repository/npm/
#   deb:
#     url: https://deb.example.com
#     # optional - the key(s) the upstream Release is signed with.
#     # Paste several armored key blocks one after another.
#     keyring: |
#       -----BEGIN PGP PUBLIC KEY BLOCK-----
#       ...
#       -----END PGP PUBLIC KEY BLOCK-----
`;

const ecosystemIcons: Record<string, string> = {
  npm: "/logos/npm-svgrepo-com.svg",
  go: "/logos/golang-svgrepo-com.svg",
  pypi: "/logos/pypi-svgrepo-com.svg",
  maven: "/logos/maven-svgrepo-com.svg",
  composer: "/logos/composer-svgrepo-com.svg",
  oci: "/assets/oci-icon-pantone.svg",
  debian: "/logos/deb-svgrepo-com.svg",
  alpine: "/logos/apk-svgrepo-com.svg",
};

const getEcosystemContent = (key: string, url: string) => {
  switch (key) {
    case "npm":
      return (
        <div>
          <InputWithButton
            label="npm Registry URL"
            message="Create a .npmrc file in your project root with this content to enable proxying for npm packages."
            value={`registry=${url}`}
            nameKey="npm-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">
              Alternatively, set it via the CLI
            </span>
            <CopyCodeFragment codeString={`npm config set registry ${url}`} />
          </div>
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">
              .yarnrc.yml (Yarn Berry)
            </span>
            <CopyCode
              language="yaml"
              codeString={`npmRegistryServer: "${url}"`}
            />
          </div>
          <Callout intent="warning">
            If your project already has a{" "}
            <code className="font-mono text-sm">package-lock.json</code>, it may
            still contain the original download URLs. Delete the lock file and
            run <code className="font-mono text-sm">npm install</code> once to
            rewrite it with the proxy URLs.
          </Callout>
        </div>
      );

    case "go":
      return (
        <div>
          <InputWithButton
            label="Go Module Proxy"
            message="Set this environment variable or add it to your shell profile (.bashrc, .zshrc) to route Go module downloads through the dependency proxy."
            value={`export GOPROXY="${url}"`}
            nameKey="go-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">
              Alternatively, persist it in the Go environment
            </span>
            <CopyCodeFragment codeString={`go env -w GOPROXY=${url}`} />
          </div>
          <Callout intent="warning">
            Do not append <code className="font-mono text-sm">,direct</code> to
            the value. Falling back to direct downloads would bypass the proxy
            for blocked modules.
          </Callout>
        </div>
      );

    case "pypi": {
      return (
        <div>
          <InputWithButton
            label="Index URL"
            message="Set as index-url in pip.conf under [global], or export as PIP_INDEX_URL."
            value={`index-url = ${url}`}
            nameKey="pypi-index-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">pip.conf</span>
            <CopyCode
              language="shell"
              codeString={`[global]
index-url = ${url}`}
            />
          </div>
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">uv (pyproject.toml)</span>
            <CopyCode
              language="shell"
              codeString={`[[tool.uv.index]]
url = "${url}"
default = true`}
            />
          </div>
          <Callout intent="warning">
            Do not configure{" "}
            <code className="font-mono text-sm">extra-index-url</code> with the
            public PyPI. Packages resolved from it bypass the proxy.
          </Callout>
        </div>
      );
    }
    case "maven": {
      return (
        <div>
          <InputWithButton
            label="Maven Repository URL"
            message="Add this mirror to your ~/.m2/settings.xml to route Maven Central downloads through the dependency proxy."
            value={url}
            nameKey="maven-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">settings.xml</span>
            <CopyCode
              language="xml"
              codeString={`<settings>
  <mirrors>
    <mirror>
      <id>devguard</id>
      <name>DevGuard Dependency Proxy</name>
      <mirrorOf>central</mirrorOf>
      <url>${url}</url>
    </mirror>
  </mirrors>
</settings>`}
            />
          </div>
          <Callout intent="warning">
            <code className="font-mono text-sm">mirrorOf</code> only redirects
            Maven Central. Dependencies resolved from other repositories
            declared in your <code className="font-mono text-sm">pom.xml</code>{" "}
            bypass the proxy. To route them through the proxy as well, add them
            to <code className="font-mono text-sm">mirrorOf</code> and set an
            upstream registry under{" "}
            <code className="font-mono text-sm">registries</code> in the proxy
            configuration that serves all of them, for example a Nexus or
            Artifactory group repository.
          </Callout>
        </div>
      );
    }
    case "composer": {
      return (
        <div>
          <InputWithButton
            label="Composer Repository URL"
            message="Run this command in your project root to replace Packagist with the dependency proxy in your composer.json."
            value={`composer config repo.packagist composer ${url}`}
            nameKey="composer-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">composer.json</span>
            <CopyCode
              language="json"
              codeString={JSON.stringify(
                {
                  repositories: {
                    packagist: { type: "composer", url },
                  },
                },
                null,
                2,
              )}
            />
          </div>
          <Callout intent="warning">
            If your project already has a{" "}
            <code className="font-mono text-sm">composer.lock</code>, it still
            contains the original download URLs and{" "}
            <code className="font-mono text-sm">composer install</code> will
            bypass the proxy. Run{" "}
            <code className="font-mono text-sm">composer update</code> once to
            rewrite the lock file with the proxy URLs.
          </Callout>
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
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">Example</span>
            <CopyCodeFragment
              codeString={`docker pull ${url}/docker.io/library/nginx:latest`}
            />
          </div>
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

    case "debian": {
      return (
        <div>
          <InputWithButton
            label="Debian Repository URL"
            message="Replace the URIs in /etc/apt/sources.list.d/debian.sources with this URL to route apt downloads through the dependency proxy. Supported are trixie and bookworm including their -updates and -security suites, component main, architectures amd64 and arm64."
            value={url}
            nameKey="deb-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">Signing key</span>
            <p className="mb-2 text-muted-foreground">
              The proxy rewrites the package index and signs it with its own
              key. apt only trusts the proxy if this key is installed.
            </p>
            <CopyCodeFragment
              codeString={`curl -fsSL ${url}/devguard-deb-keyring.asc -o /etc/apt/keyrings/devguard.asc`}
            />
            <DelayedDownloadButton
              className="mt-2"
              href={`${url}/devguard-deb-keyring.asc`}
              downloadFileName="devguard.asc"
              icon={<DownloadIcon className="h-4 w-4" />}
              label="Download signing key"
            />
          </div>
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">
              Example /etc/apt/sources.list.d/debian.sources
            </span>
            <CopyCode
              language="yaml"
              codeString={`Types: deb
URIs: ${url}
Suites: trixie trixie-updates
Components: main
Signed-By: /etc/apt/keyrings/devguard.asc

Types: deb
URIs: ${url}-security
Suites: trixie-security
Components: main
Signed-By: /etc/apt/keyrings/devguard.asc`}
            />
          </div>
          <Callout intent="info">
            Versions blocked by your rules are replaced in the package index
            with the newest allowed version, so{" "}
            <code className="font-mono text-sm">apt-get install</code> picks an
            allowed version automatically. Rule changes can take up to 30
            minutes to show up in the index.
          </Callout>
          <div className="mt-4">
            <Callout intent="warning">
              If you set your own registry under{" "}
              <code className="font-mono text-sm">registries.deb</code>, release
              times are only known for packages that also exist in the official
              Debian repository. All other packages get{" "}
              <code className="font-mono text-sm">pkg.releasedAt</code> set to
              now, so rules on the release time block them. Adjust your CEL
              rules for these packages, for example with an allow rule on{" "}
              <code className="font-mono text-sm">pkg.name</code> or{" "}
              <code className="font-mono text-sm">pkg.registry</code>.
            </Callout>
          </div>
          <div className="mt-4">
            <Callout intent="info">
              <p>
                A custom registry is configured with a{" "}
                <code className="font-mono text-sm">url</code> and an optional{" "}
                <code className="font-mono text-sm">keyring</code>:
              </p>
              <CopyCode
                language="yaml"
                codeString={`registries:
  deb:
    url: https://deb.example.com
    keyring: |
      -----BEGIN PGP PUBLIC KEY BLOCK-----
      ...
      -----END PGP PUBLIC KEY BLOCK-----`}
              />
              <p className="mt-2">
                With a keyring, the proxy only accepts a Release signed by one
                of its keys and signs the rewritten index with the signing key
                above. Several keys can be pasted as armored blocks one after
                another. Without a keyring, the upstream index is not verified
                and the proxy serves it unsigned, so apt needs{" "}
                <code className="font-mono text-sm">Trusted: yes</code> instead
                of <code className="font-mono text-sm">Signed-By</code>.
              </p>
            </Callout>
          </div>
        </div>
      );
    }

    case "alpine": {
      return (
        <div>
          <InputWithButton
            label="Alpine Repository URL"
            message="Replace the entries in /etc/apk/repositories with this URL to route apk downloads through the dependency proxy."
            value={url}
            nameKey="apk-proxy-url"
            copyable
          />
          <div className="my-4 text-sm">
            <span className="font-medium mb-1 block">
              Example /etc/apk/repositories
            </span>
            <CopyCode
              language="shell"
              codeString={`${url}/v3.20/main
${url}/v3.20/community`}
            />
          </div>
          <Callout intent="warning">
            Versions blocked by your rules are not replaced with an older
            allowed version, so{" "}
            <code className="font-mono text-sm">apk add</code> fails for them.
            Wait until the package satisfies your rules or add an allow rule for
            it.
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
  scope: ProxyScope | null;
  forceVertical?: boolean;
}

const DependencyProxyConfigs = ({ scope, forceVertical }: Props) => {
  const { config: data, proxyUrls, saveConfig } = useDependencyProxy(scope);

  const [rulesText, setRulesText] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rulesHelpOpen, setRulesHelpOpen] = useState(false);
  const scopeKey = scope ? JSON.stringify(scope) : null;
  const initializedForScope = useRef<string | null | undefined>(undefined);

  const [proxyTab, setSelectedProxyTab] = useState("");
  const selectedProxyTab = proxyTab || Object.keys(proxyUrls ?? {})[0] || "";

  useEffect(() => {
    if (data !== undefined && initializedForScope.current !== scopeKey) {
      setRulesText(data ?? defaultConfig);
      initializedForScope.current = scopeKey;
    }
  }, [data, scopeKey]);

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
    if (!scope) return;
    setIsSaving(true);
    try {
      await saveConfig(rulesText);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Failed to save dependency proxy settings";
      setCodeError(message);
      toast.error("Failed to save dependency proxy settings");
      return;
    } finally {
      setIsSaving(false);
    }
    setCodeError(null);
    toast.success("Settings saved");
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <DocDrawer
            triggerLabel="Learn how the Dependency Proxy works"
            drawerTitle="Dependency Proxy"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/how-to-guides/dependency-proxy/index.mdx"
            docsUrl="https://docs.devguard.org/how-to-guides/dependency-proxy/"
          />
        </div>
        <Section
          forceVertical={forceVertical}
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
                    <TabsTrigger className="capitalize" key={key} value={key}>
                      {ecosystemIcons[key] && (
                        <Image
                          src={ecosystemIcons[key]}
                          alt=""
                          width={16}
                          height={16}
                          className="mr-1 inline-block h-4 w-4"
                        />
                      )}
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
          forceVertical={forceVertical}
          description="Define allow and deny rules as CEL expressions in YAML. Rules are evaluated top to bottom and the last matching rule wins. Packages that match no rule are allowed."
          title="Package Rules"
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
                <a
                  href="https://docs.devguard.org/how-to-guides/dependency-proxy/package-rules/"
                  target="_blank"
                  className="ml-4 shrink-0 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Learn more about CEL rules
                </a>
              </div>
            </div>
            {rulesHelpOpen && (
              <div className="mt-2 flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p>
                  Available fields: <code className="font-mono">pkg.name</code>,{" "}
                  <code className="font-mono">pkg.version</code>,{" "}
                  <code className="font-mono">pkg.ecosystem</code> (npm, go,
                  pypi, maven, composer, deb, apk, oci),{" "}
                  <code className="font-mono">pkg.purl</code>,{" "}
                  <code className="font-mono">pkg.registry</code>,{" "}
                  <code className="font-mono">pkg.releasedAt</code> and, for npm
                  only, <code className="font-mono">pkg.publisher.name</code>{" "}
                  and{" "}
                  <code className="font-mono">
                    pkg.publisher.changedSinceLastVersion
                  </code>
                  .
                </p>
                {[
                  {
                    pattern:
                      'now() - timestamp(pkg.releasedAt) < duration("120h")',
                    desc: "Matches packages released less than 5 days ago.",
                    example: "action: deny → blocks fresh releases",
                  },
                  {
                    pattern: 'pkg.name == "lodash"',
                    desc: "Matches one package by name, in every version.",
                    example:
                      "action: allow after a deny rule → exception for lodash",
                  },
                  {
                    pattern: 'pkg.name.startsWith("@evil-scope/")',
                    desc: "Matches every package of an npm scope.",
                    example:
                      "action: deny → blocks @evil-scope/foo, @evil-scope/bar, …",
                  },
                  {
                    pattern: 'pkg.purl == "pkg:npm/lodash@4.17.21"',
                    desc: "Matches exactly one version.",
                    example: "action: deny → only lodash 4.17.21 is blocked",
                  },
                  {
                    pattern: 'pkg.ecosystem == "pypi"',
                    desc: "Matches every package of one ecosystem.",
                    example: "action: deny → blocks all PyPI packages",
                  },
                  {
                    pattern:
                      "has(pkg.publisher) && pkg.publisher.changedSinceLastVersion",
                    desc: "Matches npm versions published by a different user than the previous version.",
                    example: "action: deny → blocks possible account takeovers",
                  },
                  {
                    pattern: "'!has(pkg.releasedAt) || …'",
                    desc: "has() checks whether a field exists. Without it, a rule on a missing field fails and the package is blocked. Quote expressions that start with !.",
                    example: "OCI images have no release time",
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
          <div className="flex flex-col gap-4 md:flex-row pb-6">
            <div className="min-w-0 flex-1">
              <div>
                <p className="mb-1 text-sm font-medium">
                  Enter your dependency proxy rules below:
                </p>
              </div>
              <CodeEditor
                value={rulesText}
                language="yaml"
                onChange={setRulesText}
                onValidation={handleEditorValidation}
                onSave={
                  codeError ||
                  isSaving ||
                  rulesText === (data ?? defaultConfig) ||
                  data === undefined
                    ? undefined
                    : handleSave
                }
              />
            </div>
          </div>
          {codeError && <p className="text-sm text-destructive">{codeError}</p>}
        </Section>
        <div className="sticky bottom-0 flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              data === undefined ||
              !!codeError ||
              rulesText === (data ?? defaultConfig)
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
