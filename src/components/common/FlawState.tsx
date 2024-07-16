import { FlawDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import {
  CheckCircleIcon,
  SpeakerXMarkIcon,
  StopIcon,
  ClockIcon,
  BugAntIcon,
} from "@heroicons/react/24/outline";
import { FunctionComponent } from "react";
import { Badge } from "../ui/badge";

const FlawState: FunctionComponent<{ state: FlawDTO["state"] }> = ({
  state,
}) => {
  const defaultClasses =
    "px-2 py-1 whitespace-nowrap rounded-full flex flex-row items-center gap-1 border font-semibold";
  switch (state) {
    case "fixed":
      return (
        <Badge
          variant={"outline"}
          className={classNames(
            defaultClasses,
            "border-green-400 bg-green-200 text-green-900 dark:bg-green-400/10 dark:text-green-500",
          )}
        >
          <CheckCircleIcon className="-ml-1 inline-block h-4 w-4" />
          Fixed
        </Badge>
      );

    case "accepted":
      return (
        <Badge
          variant={"outline"}
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
          )}
        >
          <SpeakerXMarkIcon className="-ml-1 inline-block h-4 w-4" />
          Accepted
        </Badge>
      );

    case "falsePositive":
      return (
        <Badge
          variant={"outline"}
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
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
          variant={"outline"}
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
          )}
        >
          <BugAntIcon className="-ml-1 inline-block h-4 w-4" />
          Open
        </Badge>
      );
  }
};

export default FlawState;
