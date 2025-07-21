import React, { FunctionComponent } from "react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { defaultScanner } from "../utils/view";

const ScannerBadge: FunctionComponent<{ scannerID: string }> = ({
  scannerID,
}) => {
  const scannerIDBlank = scannerID.replace(defaultScanner, "");
  const parts = scannerIDBlank.split(":");
  let artifactName = scannerIDBlank;
  if (parts[0]) {
    if (parts[0] === "sca") {
      artifactName = "source-code";
    } else if (parts[0] === "container-scanning") {
      artifactName = "container";
    } else if (parts[0] === "sbom") {
      artifactName = "sbom";
    }
  }

  if (parts[1]) {
    artifactName += `:${parts[1]}`;
  }
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={"secondary"} className="line-clamp-1 text-left">
          {artifactName}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{artifactName}</TooltipContent>
    </Tooltip>
  );
};

export default ScannerBadge;
