import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { classNames } from "../../utils/common";

const activeStepIndexToOpacity = (
  activeStepIndex: number | undefined,
  i: number,
) => {
  if (activeStepIndex === undefined) {
    return "opacity-100";
  }
  if (i < activeStepIndex) {
    return "opacity-100";
  }

  if (i === activeStepIndex) {
    return "opacity-100";
  }
  return "opacity-50";
};

const variantToClassNames = (variant: "small" | "default") => {
  if (variant === "small") {
    return "h-7 w-7 relative left-1 border bg-card border-secondary";
  }
  return "h-10 w-10 bg-secondary text-secondary-foreground";
};

const Steps: FunctionComponent<
  PropsWithChildren<{
    variant?: "small" | "default";
    activeStepIndex?: number;
  }>
> = ({ children, activeStepIndex, variant }) => {
  const arr = React.Children.toArray(children);
  const lastChildRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    if (containerRef.current && lastChildRef.current) {
      setBottom(lastChildRef.current.clientHeight);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col">
      <div
        style={{
          left: "17px",
          bottom: `${bottom}px`,
        }}
        className="absolute bottom-0 top-0 border-l-4 border-dotted border-secondary"
      ></div>
      {arr.map((child, i) => (
        <div
          className={classNames(
            "flex flex-row gap-4",
            activeStepIndexToOpacity(activeStepIndex, i),
          )}
          key={i}
        >
          <div
            className={classNames(
              "relative flex flex-row items-center justify-center rounded-full border-background font-semibold ",
              variantToClassNames(variant ?? "default"),
            )}
          >
            {i + 1}
          </div>
          <div
            ref={i === arr.length - 1 ? lastChildRef : undefined}
            className="w-full flex-1"
          >
            {child}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Steps;
