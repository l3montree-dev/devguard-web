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
        <h3 className=" text-sm font-semibold">Quick Fix</h3>
        {/* <Zap /> */}
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
              <span className="text-xs text-muted-foreground">
                {`Fix ${vuln.cveID} by updating to:`}
                <CopyCode codeString={ecosystemUpdate} />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quickfix;
