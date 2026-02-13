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
  showTooltip?: boolean;
}

const PathSegment: FunctionComponent<{
  segment: string;
  showIcon?: boolean;
  truncate?: boolean;
}> = ({ segment, showIcon = false, truncate = false }) => {
  if (segment === "*") return <span>*</span>;

  const version = extractVersion(segment);
  const packageName = beautifyPurl(segment);

  return (
    <>
      {showIcon && <EcosystemImage size={12} packageName={segment} />}
      <span className={truncate ? "truncate max-w-[50px]" : ""}>
        {packageName}
      </span>
      {version && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          @{version}
        </span>
      )}
    </>
  );
};

const VexPathPattern: FunctionComponent<VexPathPatternProps> = ({
  pathPattern,
  showTooltip = true,
}) => {
  const content = (
    <div className="text-sm text-foreground flex flex-wrap items-center gap-1">
      <span className="inline-flex items-center">
        <Badge variant="outline" className="gap-1">
          <span>*</span>
        </Badge>
        <span className="mx-1">→</span>
      </span>
      {pathPattern.map((segment, index) => (
        <span key={index} className="inline-flex items-center">
          <Badge variant="outline" className="gap-1 min-w-0">
            <PathSegment segment={segment} truncate={true} />
          </Badge>
          {index < pathPattern.length - 1 && <span className="mx-1">→</span>}
        </span>
      ))}
    </div>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger className="text-left">{content}</TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-wrap flex-row items-start gap-2 break-all max-w-md">
          <span className="flex flex-row items-center gap-1">
            <span>*</span>
            <span>→</span>
          </span>
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
