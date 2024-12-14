import { classNames } from "@/utils/common";
import { Tab as BaseTab } from "@headlessui/react";
import { Fragment, FunctionComponent, PropsWithChildren } from "react";
const CustomTab: FunctionComponent<
  PropsWithChildren<{
    className?: string;
  }>
> = (props) => {
  return (
    <BaseTab as={Fragment}>
      {({ selected }) => (
        <div
          className={classNames(
            "mr-2 inline-block  cursor-pointer rounded-lg px-2 py-2 text-sm transition-all",
            selected ? "bg-secondary" : "hover:bg-secondary",
            props.className,
          )}
        >
          {props.children}
        </div>
      )}
    </BaseTab>
  );
};

export default CustomTab;
