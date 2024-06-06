import React, { FunctionComponent, PropsWithChildren } from "react";

const Steps: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
  const arr = React.Children.toArray(children);
  return (
    <div className="relative flex flex-col">
      <div
        style={{
          left: "17px",
        }}
        className="absolute bottom-0 top-0 border-l-4 border-dotted dark:border-slate-700"
      ></div>
      {arr.map((child, i) => (
        <div className="flex flex-row gap-4" key={i}>
          <div className="relative flex h-10 w-10 flex-row items-center justify-center rounded-full border-4 border-white bg-zinc-200  font-semibold dark:border-slate-900 dark:bg-slate-700">
            {i + 1}
          </div>
          <div className="w-full flex-1">{child}</div>
        </div>
      ))}
    </div>
  );
};

export default Steps;
