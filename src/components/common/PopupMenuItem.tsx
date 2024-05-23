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
      className="flex p-1 flex-row min-w-[250px] rounded-md cursor-pointer hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 transition-all gap-2 items-center"
    >
      {Boolean(Icon) && (
        <div className="h-7 w-7 relative z-30 rounded-md font-semibold flex flex-col justify-center items-center text-2xl aspect-square">
          {Icon}
        </div>
      )}
      <div>{text}</div>
    </div>
  );
};

export default PopupMenuItem;
