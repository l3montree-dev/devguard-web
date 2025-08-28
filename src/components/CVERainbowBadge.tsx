import React from "react";
import { classNames } from "../utils/common";
import { getSeverityClassNames } from "./common/Severity";

interface Props {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

const CVERainbowBadge = (props: Props) => {
  return (
    <div className="flex flex-row font-normal text-xs text-white rounded-full overflow-hidden whitespace-nowrap items-center">
      <span
        className={classNames(
          "inline-block px-1",
          getSeverityClassNames("CRITICAL", false),
        )}
      >
        {props.critical}
      </span>
      <span
        className={classNames(
          "inline-block px-1",
          getSeverityClassNames("HIGH", false),
        )}
      >
        {props.high}
      </span>
      <span
        className={classNames(
          "inline-block px-1",
          getSeverityClassNames("MEDIUM", false),
        )}
      >
        {props.medium}
      </span>
      <span
        className={classNames(
          "inline-block px-1",
          getSeverityClassNames("LOW", false),
        )}
      >
        {props.low}
      </span>
    </div>
  );
};

export default CVERainbowBadge;
