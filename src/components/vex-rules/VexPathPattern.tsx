import EcosystemImage from "@/components/common/EcosystemImage";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { beautifyPurl, extractVersion } from "@/utils/common";
import { FunctionComponent } from "react";

interface VexPathPatternProps {
  pathPattern: string[];
}

const PathSegment: FunctionComponent<{
  segment: string;
  showIcon?: boolean;
}> = ({ segment, showIcon = false }) => {
  if (segment === "*") return <span>*</span>;

  const version = extractVersion(segment);
  const packageName = beautifyPurl(segment);

  return (
    <>
      {showIcon && <EcosystemImage size={12} packageName={segment} />}
      <span>{packageName}</span>
      {version && (
        <span className="text-xs text-muted-foreground">@{version}</span>
      )}
    </>
  );
};

const VexPathPattern: FunctionComponent<VexPathPatternProps> = ({
  pathPattern,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger className="text-left">
        <div className="text-sm text-foreground truncate max-w-md">
          {pathPattern.map((segment, index) => (
            <span key={index} className="inline-flex items-center">
              <Badge variant="outline" className="gap-1">
                <PathSegment segment={segment} />
              </Badge>
              {index < pathPattern.length - 1 && (
                <span className="mx-1">→</span>
              )}
            </span>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-wrap flex-row items-start gap-2 break-all max-w-md">
          {pathPattern.map((segment, index) => (
            <span key={index} className="flex flex-row items-center gap-1">
              <PathSegment segment={segment} showIcon={segment !== "*"} />
              {index < pathPattern.length - 1 && <span>→</span>}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default VexPathPattern;
