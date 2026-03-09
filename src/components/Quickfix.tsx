import { FunctionComponent } from "react";
import CopyCode from "@/components/common/CopyCode";
import { DetailedDependencyVulnDTO } from "@/types/api/api";
import { beautifyPurl, extractVersion, getEcosystem } from "@/utils/common";
import { Zap, MoveDownIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { diffChars } from "diff";
import { PackageURL } from "packageurl-js";

interface DiffHighlighterProps {
  oldVersion: string;
  newVersion?: string;
}

// PackageURL.fromString("pkg:deb/debian/file@5.46-5?arch=arm64").toString();

const DiffHighlighter: FunctionComponent<DiffHighlighterProps> = ({
  oldVersion,
  newVersion,
}) => {
  const { type, namespace, name, version } = PackageURL.fromString(oldVersion);

  if (newVersion) {
    const differences = diffChars(name + "@" + version, newVersion ?? "");
    return (
      <div className="font-mono text-xs">
        {differences.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? "bg-green-200 text-green-900 font-mono"
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
      const [packageName, packageVersion] =
        directDependencyFixedVersion.split("@");
      return `apt-get install -y ${packageName}=${packageVersion}`;
    }
    default:
      return "";
  }
}

const Quickfix: FunctionComponent<{ vuln: DetailedDependencyVulnDTO }> = ({
  vuln,
}) => {
  //   console.log("Quickfix component received vuln:", vuln);
  console.log(vuln.vulnerabilityPath[0]);

  const componentPurl = vuln.componentPurl;
  const directDependencyFixedVersion =
    vuln.directDependencyFixedVersion ?? undefined;
  const ecosystemUpdate = renderQuickFixText(
    componentPurl,
    directDependencyFixedVersion,
  );

  const { type, namespace, name, version } = PackageURL.fromString(
    vuln.vulnerabilityPath[0],
  );

  return (
    <>
      <div className="p-5">
        <div className="flex flex-row mb-2 gap-0.5 items-center">
          <h3 className=" text-sm font-semibold">Quick Fix</h3>
        </div>
        <div className="relative rounded-lg border bg-card p-4 border">
          <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
          </span>
          <div className="text-sm">
            {!directDependencyFixedVersion ? (
              <span className="text-xs text-muted-foreground">
                No Quickfix available
              </span>
            ) : (
              <>
                <span className="flex flex-row gap-2 items-center gap-0.5">
                  <Zap className="h-4" />
                  <span className="flex-1 text-left">{vuln.cveID}</span>
                </span>
                <div className="mt-1 flex flex-row gap-2"></div>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex flew-row gap-2">
                    <span>Before: </span>
                    <Badge
                      className="font-mono"
                      variant={"outline"}
                    >{`${name + "@" + version}`}</Badge>
                  </div>
                  <div>
                    <span>After: </span>
                    <Badge variant={"outline"} className="font-mono">
                      {
                        <DiffHighlighter
                          oldVersion={vuln.vulnerabilityPath[0] || ""}
                          newVersion={vuln.directDependencyFixedVersion || ""}
                        ></DiffHighlighter>
                      }
                    </Badge>
                  </div>
                </div>
                {/* <CopyCode codeString={ecosystemUpdate} /> */}
              </>
            )}
          </div>
        </div>
        <Link
          target="_blank"
          className="text-xs"
          href={"https://devguard.org/"}
        >
          See how Quick Fix works
        </Link>
      </div>
    </>
  );
};

export default Quickfix;
