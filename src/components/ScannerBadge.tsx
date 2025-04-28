import React, { FunctionComponent } from "react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { defaultScanner } from "../utils/view";

const ScannerBadge: FunctionComponent<{ scannerID: string }> = ({
  scannerID,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={"secondary"} className="line-clamp-1 text-left">
          {scannerID.replace(defaultScanner, "")}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{scannerID}</TooltipContent>
    </Tooltip>
  );
};

export default ScannerBadge;
