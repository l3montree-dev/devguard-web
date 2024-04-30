import React, { FunctionComponent } from "react";

interface Props {
  Button?: React.ReactNode;
  title: string;
  description?: string;
}
const ListItem: FunctionComponent<Props> = ({ Button, title, description }) => {
  return (
    <div className="flex items-center justify-between gap-x-6 rounded-lg border bg-white px-5 py-5 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <div className="min-w-0">
        <div className="">
          <span className="font-semibold leading-6">{title}</span>
        </div>
        {!!description && (
          <div className="mt-2">
            <p className="text-sm opacity-75">{description}</p>
          </div>
        )}
      </div>
      <div className="flex flex-none items-center gap-x-4">{Button}</div>
    </div>
  );
};

export default ListItem;
