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
            "bg-green-200 border-green-400 text-green-900",
          )}
        >
          <CheckCircleIcon className="w-4 h-4 inline-block" />
          Fixed
        </div>
      );

    case "accepted":
      return (
        <div
          className={classNames(
            defaultClasses,
            "bg-slate-200 text-gray-800 border-gray-400",
          )}
        >
          <SpeakerXMarkIcon className="w-4 h-4 inline-block" />
          Ignored
        </div>
      );

    case "falsePositive":
      return (
        <div
          className={classNames(
            defaultClasses,
            "bg-slate-200 text-gray-800 border-gray-400",
          )}
        >
          <StopIcon className="w-4 h-4 inline-block" />
          False Positive
        </div>
      );

    case "markedForMitigation":
      return (
        <div
          className={classNames(
            defaultClasses,
            "bg-purple-200 border-purple-300 text-purple-800",
          )}
        >
          <ClockIcon className="w-4 h-4 inline-block" />
          Marked for Mitigation
        </div>
      );
    case "open":
    default:
      return (
        <div
          className={classNames(
            defaultClasses,
            "bg-red-200 border-red-300 text-red-800",
          )}
        >
          <BugAntIcon className="w-4 h-4 inline-block" />
          Open
        </div>
      );
  }
};

export default FlawState;
