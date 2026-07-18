import { type FunctionComponent, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  description: ReactNode;
}
const WarningWithDescription: FunctionComponent<Props> = ({ description }) => {
  return (
    <Tooltip>
      <TooltipTrigger aria-label="Warning">
        <TriangleAlert className="inline-block h-6 w-6 text-destructive" />
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
};

export default WarningWithDescription;
