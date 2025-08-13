import { FunctionComponent } from "react";
import { getArtifactNameFromScannerID } from "../utils/view";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const ScannerBadge: FunctionComponent<{ scannerID: string }> = ({
  scannerID,
}) => {
  const artifactName = getArtifactNameFromScannerID(scannerID);
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

export default ScannerBadge;
