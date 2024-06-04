import { FlawDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import {
  CheckCircleIcon,
  SpeakerXMarkIcon,
  StopIcon,
  ClockIcon,
  BugAntIcon,
} from "@heroicons/react/24/solid";
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
            "border-gray-400 bg-gray-200 text-gray-800 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-400",
          )}
        >
          <SpeakerXMarkIcon className="inline-block h-4 w-4" />
          Ignored
        </div>
      );

    case "falsePositive":
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-gray-400 bg-gray-200 text-gray-800 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-400",
          )}
        >
          <StopIcon className="inline-block h-4 w-4" />
          False Positive
        </div>
      );

    case "markedForMitigation":
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-purple-300 bg-purple-200 text-purple-800 dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-500",
          )}
        >
          <ClockIcon className="inline-block h-4 w-4" />
          Marked for Mitigation
        </div>
      );
    case "open":
    default:
      return (
        <div
          className={classNames(
            defaultClasses,
            "border-red-300 bg-red-200 text-red-800 dark:border-red-500 dark:bg-red-500/10 dark:text-red-500",
          )}
        >
          <BugAntIcon className="inline-block h-4 w-4" />
          Open
        </div>
      );
  }
};

export default FlawState;
