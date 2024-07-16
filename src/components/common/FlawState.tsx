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

const FlawState: FunctionComponent<{ state: FlawDTO["state"] }> = ({
  state,
}) => {
  const defaultClasses =
    "px-2 py-1 whitespace-nowrap rounded-full flex flex-row items-center gap-1 border font-semibold";
  switch (state) {
    case "fixed":
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-green-400 bg-green-200 text-green-900 dark:bg-green-400/10 dark:text-green-500",
          )}
        >
          <CheckCircleIcon className="inline-block h-4 w-4" />
          Fixed
        </div>
      );

    case "accepted":
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
          )}
        >
          <SpeakerXMarkIcon className="inline-block h-4 w-4" />
          Accepted
        </div>
      );

    case "falsePositive":
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
          )}
        >
          <StopIcon className="inline-block h-4 w-4" />
          False Positive
        </div>
      );

    case "open":
    default:
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-gray-500 text-gray-500 dark:text-gray-300",
          )}
        >
          <BugAntIcon className="inline-block h-4 w-4" />
          Open
        </div>
      );
  }
};

export default FlawState;
