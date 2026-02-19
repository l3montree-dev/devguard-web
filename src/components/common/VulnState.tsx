import { classNames } from "@/utils/common";
import {
  BugAntIcon,
  CheckCircleIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { FunctionComponent } from "react";
import { Badge } from "../ui/badge";
import { DependencyVuln, ExpandedVulnDTOState } from "../../types/api/api";
import { Scale, Bug } from "lucide-react";
import { evTypeBackground } from "@/utils/view";

const VulnState: FunctionComponent<{ state: DependencyVuln["state"] }> = ({
  state,
}) => {
  const defaultClasses =
    "px-2 py-1 whitespace-nowrap rounded-full flex flex-row items-center gap-1 border font-semibold";
  switch (state) {
    case "fixed":
      return (
        <Badge
          variant={"default"}
          className={classNames(
            evTypeBackground["fixed"],
            "text-secondary-foreground",
          )}
        >
          <CheckCircleIcon className="-ml-1 inline-block h-4 w-4" />
          Fixed
        </Badge>
      );

    case "accepted":
      return (
        <Badge
          variant={"default"}
          className={classNames(
            defaultClasses,
            evTypeBackground["accepted"],
            "text-secondary-foreground",
          )}
        >
          <SpeakerXMarkIcon className="-ml-1 inline-block h-4 w-4" />
          Accepted
        </Badge>
      );

    case "falsePositive":
      return (
        <Badge
          variant={"default"}
          className={classNames(
            defaultClasses,
            evTypeBackground["falsePositive"],
            "text-secondary-foreground",
          )}
        >
          <StopIcon className="-ml-1 inline-block h-4 w-4" />
          False Positive
        </Badge>
      );

    case "open":
    default:
      return (
        <Badge
          variant={"default"}
          className={classNames(
            "text-secondary-foreground px-3 py-1 bg-secondary",
          )}
        >
          <Bug className="-ml-1 inline-block h-4 w-4 mr-1" />
          Open
        </Badge>
      );
  }
};

export default VulnState;
