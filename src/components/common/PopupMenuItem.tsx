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
      className="flex flex-row rounded-sm cursor-pointer hover:bg-blue-100 items-center gap-2"
    >
      {Boolean(Icon) && (
        <div className="bg-blue-300 h-9 w-9 relative z-30 rounded-sm font-semibold flex flex-col justify-center items-center text-black text-2xl aspect-square m-1">
          {Icon}
        </div>
      )}
      <div>{text}</div>
    </div>
  );
};

export default PopupMenuItem;
