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
        <TriangleAlert className="inline-block h-5 w-5 text-destructive" />
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
};

export default WarningWithDescription;
