// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import CopyCode from "@/components/common/CopyCode";
import { DocDrawer } from "@/components/common/DocDrawer";
import Purl from "@/components/common/Purl";
import type { DetailedDependencyVulnDTO } from "@/types/api/api";
import { isValidPackagePurl } from "@/utils/common";
import { Wrench } from "lucide-react";
import { PackageURL } from "packageurl-js";
import type { FunctionComponent } from "react";

function renderQuickFixText(
  fixedVersionPurl: string | null | undefined,
): string {
  if (!fixedVersionPurl || !isValidPackagePurl(fixedVersionPurl)) return "";

  const { type, namespace, name, version } =
    PackageURL.fromString(fixedVersionPurl);
  const fullName = namespace ? `${namespace}/${name}` : name;

  switch (type) {
    case "npm":
      return `npm install ${fullName}@${version}`;
    case "golang": {
      const goVersion = version?.startsWith("v") ? version : `v${version}`;
      return `go get ${fullName}@${goVersion}`;
    }
    case "pypi":
      return `pip install ${fullName}==${version}`;
    case "cargo":
      return `# in Cargo.toml: ${name} = "${version}"`;
    case "nuget":
      return `dotnet add package ${name} --version ${version}`;
    case "apk":
      return `apk add ${name}=${version}`;
    case "deb":
      return `apt-get install -y ${name}=${version}`;
    default:
      return "";
  }
}

import type { QuickfixVuln } from "@/types/view/asset";

export function getFixedVersionPurl(vuln: QuickfixVuln): string | null {
  if (!vuln.directDependencyFixedVersion && vuln.componentFixedVersion) {
    if (vuln.vulnerabilityPath && vuln.vulnerabilityPath.length === 1) {
      const purl = PackageURL.fromString(vuln.vulnerabilityPath[0]); // Check if it's a valid purl
      purl.version = vuln.componentFixedVersion;
      return purl.toString();
    }
    return null;
  }
  return vuln.directDependencyFixedVersion;
}

export function isDirectDependencyUpdateAvailable(vuln: QuickfixVuln): boolean {
  const fixedVersionPurl = getFixedVersionPurl(vuln);
  const ecosystemUpdate = renderQuickFixText(fixedVersionPurl);

  return (
    fixedVersionPurl !== null &&
    ecosystemUpdate !== "" &&
    vuln.vulnerabilityPath.length > 0
  );
}

const Quickfix: FunctionComponent<{ vuln: DetailedDependencyVulnDTO }> = ({
  vuln,
}) => {
  const fixedVersionPurl = getFixedVersionPurl(vuln);
  const ecosystemUpdate = renderQuickFixText(fixedVersionPurl);
  if (
    fixedVersionPurl === null ||
    ecosystemUpdate === "" ||
    vuln.vulnerabilityPath.length === 0
  ) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-success bg-card shadow-lg shadow-success/20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 invert dark:invert-0"
      />

      <div className="relative z-10 flex flex-col gap-3 p-5">
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
              <Wrench className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-medium text-muted-foreground">
                Quick Fix available
              </span>
              <span className="text-base font-semibold">
                {`Resolve ${vuln.cveID} by upgrading`}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <Purl variant="compact" purl={fixedVersionPurl} /> patches{" "}
          {vuln.cveID} found in{" "}
          <Purl
            variant="compact"
            purl={vuln.vulnerabilityPath[vuln.vulnerabilityPath.length - 1]}
          />
        </p>

        <div className="mt-1 flex">
          <CopyCode codeString={ecosystemUpdate} language="shell" />
        </div>
        <div className="mt-2 flex flex-row items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
          <DocDrawer
            triggerLabel="See how Quick Fix works"
            drawerTitle="Quick Fixes with DevGuard"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/supply-chain-security/transitive-vulnerability-path-analysis.mdx"
            docsUrl="https://docs.devguard.org/explanations/supply-chain-security/transitive-vulnerability-path-analysis/"
          />
        </div>
      </div>
    </div>
  );
};

export default Quickfix;
