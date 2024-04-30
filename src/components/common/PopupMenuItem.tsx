import React, { FunctionComponent, ReactNode } from "react";

interface Props {
  Icon?: ReactNode;
  text: string;
  onClick?: () => void;
}
const PopupMenuItem: FunctionComponent<Props> = ({ Icon, onClick, text }) => {
  return (
    <div
      onClick={onClick}
      className="flex min-w-[250px] cursor-pointer flex-row items-center gap-2 rounded-md p-1 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
    >
      {Boolean(Icon) && (
        <div className="relative z-30 flex aspect-square h-7 w-7 flex-col items-center justify-center rounded-md text-2xl font-semibold">
          {Icon}
        </div>
      )}
      <div>{text}</div>
    </div>
  );
};

export default PopupMenuItem;
