import { classNames } from "@/utils/common";
import {
  BugAntIcon,
  CheckCircleIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { FunctionComponent } from "react";
import { Badge } from "../ui/badge";
import { VulnDTO } from "../../types/api/api";

const VulnState: FunctionComponent<{ state: VulnDTO["state"] }> = ({
  state,
}) => {
  const defaultClasses =
    "px-2 py-1 whitespace-nowrap rounded-full flex flex-row items-center gap-1 border font-semibold";
  switch (state) {
    case "fixed":
      return (
        <Badge
          variant={"default"}
          className={classNames(defaultClasses, "bg-green-500 text-black")}
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
            "bg-secondary text-secondary-foreground",
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
            "bg-secondary text-secondary-foreground",
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
            defaultClasses,
            "bg-secondary text-secondary-foreground",
          )}
        >
          <BugAntIcon className="-ml-1 inline-block h-4 w-4" />
          Open
        </Badge>
      );
  }
};

export default VulnState;
