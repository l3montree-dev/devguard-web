import { FunctionComponent } from "react";
import CopyCode from "@/components/common/CopyCode";
import { DetailedDependencyVulnDTO } from "@/types/api/api";
import { getEcosystem } from "@/utils/common";
import { Zap } from "lucide-react";

function renderQuickFixText(
  componentPurl: string,
  directDependencyFixedVersion: string | null,
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
      return `apt-get install -y ${directDependencyFixedVersion}`;
    }
    default:
      return "";
  }
}

const Quickfix: FunctionComponent<{ vuln: DetailedDependencyVulnDTO }> = ({
  vuln,
}) => {
  console.log("Quickfix component received vuln:", vuln);
  const componentPurl = vuln.componentPurl;
  const directDependencyFixedVersion = vuln.directDependencyFixedVersion;
  const ecosystemUpdate = renderQuickFixText(
    componentPurl,
    directDependencyFixedVersion,
  );

  return (
    <div className="p-5">
      <div className="flex flex-row mb-2 gap-2 items-center">
        <Zap />
        <h3 className=" text-sm font-semibold">Quick Fix</h3>
      </div>
      <div className="rounded-lg border bg-card p-4 border">
        <div className="text-sm">
          {!directDependencyFixedVersion ? (
            <span className="text-xs text-muted-foreground">
              No Quickfix available
            </span>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                Update direct dependency to version to fix the vulnerability.{" "}
                {directDependencyFixedVersion}
              </span>

              <CopyCode codeString={ecosystemUpdate} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quickfix;
