import { classNames } from "@/utils/common";
import { Tab as BaseTab } from "@headlessui/react";
import { Fragment, FunctionComponent, PropsWithChildren } from "react";
const CustomTab: FunctionComponent<PropsWithChildren<{}>> = (props) => {
  return (
    <BaseTab as={Fragment}>
      {({ selected }) => (
        <div
          className={classNames(
            "mr-2 inline-block cursor-pointer rounded-lg px-2 py-2 text-sm transition-all",
            selected
              ? "bg-zinc-200 dark:bg-slate-800"
              : "hover:bg-zinc-200 dark:hover:bg-slate-800",
          )}
        >
          {props.children}
        </div>
      )}
    </BaseTab>
  );
};

export default CustomTab;
