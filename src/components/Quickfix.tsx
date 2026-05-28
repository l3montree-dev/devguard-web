import CopyCode from "@/components/common/CopyCode";
import { DocDrawer } from "@/components/common/DocDrawer";
import type { DetailedDependencyVulnDTO } from "@/types/api/api";
import {
  beautifyPurl,
  isValidPackagePurl,
  purlToDisplayString,
} from "@/utils/common";
import { diffChars } from "diff";
import { ArrowRight } from "lucide-react";
import { PackageURL } from "packageurl-js";
import type { FunctionComponent } from "react";
import { Badge } from "./ui/badge";
interface DiffHighlighterProps {
  oldVersionPurl: string;
  newVersionPurl?: string; // has to be a purl
}

export const DiffHighlighter: FunctionComponent<DiffHighlighterProps> = ({
  oldVersionPurl: oldVersionPurl,
  newVersionPurl: newVersionPurl,
}) => {
  if (!isValidPackagePurl(oldVersionPurl)) {
    return <span className="font-mono text-xs">{oldVersionPurl}</span>;
  }

  const { name, version } = PackageURL.fromString(oldVersionPurl);

  if (newVersionPurl && isValidPackagePurl(newVersionPurl)) {
    const { version: newVer } = PackageURL.fromString(newVersionPurl);
    const differences = diffChars(name + "@" + version, name + "@" + newVer);

    return (
      <div className="font-mono text-xs">
        {differences.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? "text-success font-mono"
                : part.removed
                  ? "bg-destructive-muted text-destructive"
                  : ""
            }
          >
            {!part.removed && part.value}
          </span>
        ))}
      </div>
    );
  }
  return null;
};

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
    case "golang":
      return `go get ${fullName}@v${version}`;
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

function getFixedVersionPurl(vuln: DetailedDependencyVulnDTO): string | null {
  return vuln.directDependencyFixedVersion;
}

const Quickfix: FunctionComponent<{ vuln: DetailedDependencyVulnDTO }> = ({
  vuln,
}) => {
  const fixedVersionPurl = getFixedVersionPurl(vuln);
  const ecosystemUpdate = renderQuickFixText(fixedVersionPurl);

  if (!vuln.vulnerabilityPath || vuln.vulnerabilityPath.length === 0) {
    return null;
  }

  const vulnerabilityPath = vuln.vulnerabilityPath[0];

  // Only show quickfix for direct dependencies, or for ecosystems with a resolver (deb, npm)
  const isDirectDep = vuln.vulnerabilityPath.length === 1;
  const ecosystem = isValidPackagePurl(vulnerabilityPath)
    ? PackageURL.fromString(vulnerabilityPath).type
    : null;
  const hasResolver = ecosystem === "deb" || ecosystem === "npm";

  if (!isDirectDep && !hasResolver) {
    return null;
  }

  // Validate the vulnerability path is a valid PURL before parsing
  if (!isValidPackagePurl(vulnerabilityPath)) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <span className="text-xs text-muted-foreground">
          Invalid package URL: {vulnerabilityPath}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="flex flex-row mb-2 gap-0.5 items-center"></div>
        <div className="relative rounded-lg border bg-card p-4 border">
          <div className="text-sm">
            {!fixedVersionPurl ? (
              <span className="text-xs text-muted-foreground">
                {`No Update for ${beautifyPurl(vulnerabilityPath)} that patches ${vuln.cveID}`}
              </span>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className="absolute top-0 left-0 -translate-y-1/2 bg-success text-success-foreground border-success flex items-center gap-1"
                >
                  Resolve Vulnerability
                </Badge>
                <div className="flex flex-row gap-1 items-center">
                  <span>Fix the vulnerability </span>
                  <span className="font-semibold">{vuln.cveID}</span>
                  <span> by upgrading from: </span>
                  <span className="flex flex-row gap-2">
                    <Badge className="font-mono" variant={"outline"}>
                      {purlToDisplayString(vulnerabilityPath)}
                    </Badge>
                    <ArrowRight className="w-4" />
                    <Badge
                      variant={"outline"}
                      className="font-mono scale-100 relative border-2"
                    >
                      <DiffHighlighter
                        oldVersionPurl={vulnerabilityPath}
                        newVersionPurl={fixedVersionPurl ?? ""}
                      />
                    </Badge>
                  </span>
                </div>
                <div className="mt-2 flex">
                  <CopyCode codeString={ecosystemUpdate} language="shell" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mb-2">
          <DocDrawer
            triggerLabel="See how Quick Fix works"
            drawerTitle="Quick Fixes with DevGuard"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/supply-chain-security/transitive-vulnerability-path-analysis.mdx"
            docsUrl="https://docs.devguard.org/explanations/supply-chain-security/transitive-vulnerability-path-analysis/"
          />
        </div>
      </div>
    </>
  );
};

export default Quickfix;
