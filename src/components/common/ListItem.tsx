import React, { FunctionComponent } from "react";

interface Props {
  Button?: React.ReactNode;
  title: string;
  description?: string;
}
const ListItem: FunctionComponent<Props> = ({ Button, title, description }) => {
  return (
    <div className="flex transition-all bg-white border rounded-lg shadow-sm px-5 items-center justify-between gap-x-6 py-5">
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
