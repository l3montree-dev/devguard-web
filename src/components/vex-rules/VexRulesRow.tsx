import { VexRule } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { Row, flexRender } from "@tanstack/react-table";
import { FunctionComponent } from "react";

interface VexRulesRowProps {
  row: Row<VexRule>;
  index: number;
  isLast: boolean;
}

const VexRulesRow: FunctionComponent<VexRulesRowProps> = ({
  row,
  index,
  isLast,
}) => {
  return (
    <tr
      className={classNames(
        "relative align-center transition-all",
        !isLast && "border-b",
        index % 2 !== 0 && "bg-card/50",
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <td className="p-4" key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default VexRulesRow;
