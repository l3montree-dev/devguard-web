import EcosystemImage from "@/components/common/EcosystemImage";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { beautifyPurl } from "@/utils/common";
import { FunctionComponent } from "react";

interface VexPathPatternProps {
  pathPattern: string;
}

const VexPathPattern: FunctionComponent<VexPathPatternProps> = ({
  pathPattern,
}) => {
  // Parse the path pattern - could be a single purl or multiple purls separated by arrows
  // For now, treat it as a single path since the backend sends a single purl
  // But we'll structure it to handle multiple paths if needed in the future

  return (
    <Tooltip>
      <TooltipTrigger className="text-left">
        <div className="text-sm text-foreground truncate max-w-md">
          <Badge variant="outline">{beautifyPurl(pathPattern)}</Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-wrap flex-row items-start gap-2 break-all max-w-md">
          <span className="flex flex-row items-center gap-1">
            <EcosystemImage size={12} packageName={pathPattern} />
            {beautifyPurl(pathPattern)}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default VexPathPattern;
