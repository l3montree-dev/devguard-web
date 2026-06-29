import React, {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { TriangleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  description: ReactNode;
}
const WarningWithDescription: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  description,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <TriangleAlert className="inline-block h-6 w-6 text-destructive" />
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
};

export default WarningWithDescription;
