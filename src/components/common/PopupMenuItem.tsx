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
      className="flex p-1 flex-row min-w-[250px] rounded-md cursor-pointer hover:bg-slate-100 gap-2 items-center"
    >
      {Boolean(Icon) && (
        <div className="bg-slate-300 h-9 w-9 relative z-30 rounded-md font-semibold flex flex-col justify-center items-center text-black text-2xl aspect-square">
          {Icon}
        </div>
      )}
      <div>{text}</div>
    </div>
  );
};

export default PopupMenuItem;
