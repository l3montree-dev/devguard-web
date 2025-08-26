import { FunctionComponent } from "react";

import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const ArtifactBadge: FunctionComponent<{ artifactName: string }> = ({
  artifactName,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant={"secondary"}
          className="line-clamp-1 text-left max-w-52"
        >
          {artifactName}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{artifactName}</TooltipContent>
    </Tooltip>
  );
};

export default ArtifactBadge;
