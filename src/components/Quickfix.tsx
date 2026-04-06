import type { FunctionComponent } from "react";
import CopyCode from "@/components/common/CopyCode";
import type { DetailedDependencyVulnDTO } from "@/types/api/api";
import { getEcosystem } from "@/utils/common";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { diffChars } from "diff";
import { PackageURL } from "packageurl-js";
import { isValidPackagePurl } from "@/utils/common";
interface DiffHighlighterProps {
  oldVersion: string;
  newVersion?: string;
}

export const DiffHighlighter: FunctionComponent<DiffHighlighterProps> = ({
  oldVersion,
  newVersion,
}) => {
  if (!isValidPackagePurl(oldVersion)) {
    return <span className="font-mono text-xs">{oldVersion}</span>;
  }

  const { name, version } = PackageURL.fromString(oldVersion);

  if (newVersion && isValidPackagePurl(newVersion)) {
    const { version: newVer } = PackageURL.fromString(newVersion);
    const differences = diffChars(name + "@" + version, name + "@" + newVer);

    return (
      <div className="font-mono text-xs">
        {differences.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? "text-green-500 font-mono"
                : part.removed
                  ? "bg-red-200 text-red-900"
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
  componentPurl: string,
  directDependencyFixedVersion: string | null | undefined,
): string {
  if (!directDependencyFixedVersion) return "";

  const ecosystem = getEcosystem(componentPurl);

  switch (ecosystem) {
    case "npm": {
      return `npm install ${directDependencyFixedVersion}`;
    }
    case "golang": {
      return `go get ${directDependencyFixedVersion}`;
    }
    case "pypi": {
      return `pip install ${directDependencyFixedVersion}`;
    }
    case "cargo": {
      return `# in Cargo.toml: ${directDependencyFixedVersion}`;
    }
    case "nuget": {
      return `dotnet add package ${directDependencyFixedVersion}`;
    }
    case "apk": {
      return `apk add ${directDependencyFixedVersion}`;
    }
    case "deb": {
      if (isValidPackagePurl(directDependencyFixedVersion)) {
        const { name, version } = PackageURL.fromString(
          directDependencyFixedVersion,
        );
        return `apt-get install -y ${name}=${version}`;
      }
      return `apt-get install -y ${directDependencyFixedVersion}`;
    }
    default:
      return "";
  }
}

const Quickfix: FunctionComponent<{ vuln: DetailedDependencyVulnDTO }> = ({
  vuln,
}) => {
  const componentPurl = vuln.componentPurl;
  const directDependencyFixedVersion =
    vuln.directDependencyFixedVersion ?? undefined;
  const ecosystemUpdate = renderQuickFixText(
    componentPurl,
    directDependencyFixedVersion,
  );

  const vulnerabilityPath = vuln.vulnerabilityPath[0];

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

  const { type, namespace, name, version } =
    PackageURL.fromString(vulnerabilityPath);

  return (
    <>
      <div className="">
        <div className="flex flex-row mb-2 gap-0.5 items-center"></div>
        <div className="relative rounded-lg border bg-card p-4 border">
          <div className="text-sm">
            {!directDependencyFixedVersion ? (
              <span className="text-xs text-muted-foreground">
                {`No Update for ${name + "@" + version} that patches ${vuln.cveID}`}
              </span>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className="absolute top-0 left-0 -translate-y-1/2 text-[10px] px-1.5 py-0 font-semibold shadow-md bg-green-500 text-white border-green-500 flex items-center gap-1"
                >
                  Resolve Vulnerability
                </Badge>
                <div className="flex flex-row gap-1 items-center">
                  <span>Fix the vulnerability </span>
                  <span className="font-semibold text-primary">
                    {vuln.cveID}
                  </span>
                  <span> by upgrading from: </span>
                  <span className="flex flex-row gap-2">
                    <Badge
                      className="font-mono"
                      variant={"outline"}
                    >{`${name + "@" + version}`}</Badge>
                    <ArrowRight className="w-4" />
                    <Badge
                      variant={"outline"}
                      className="font-mono scale-100 relative border-2"
                    >
                      {
                        <DiffHighlighter
                          oldVersion={vuln.vulnerabilityPath[0] || ""}
                          newVersion={vuln.directDependencyFixedVersion || ""}
                        ></DiffHighlighter>
                      }
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
          <Link
            target="_blank"
            className="text-xs"
            href={
              "https://devguard.org/explanations/supply-chain-security/transitive-vulnerability-path-analysis"
            }
          >
            See how Quick Fix works
          </Link>
        </div>
      </div>
    </>
  );
};

export default Quickfix;
