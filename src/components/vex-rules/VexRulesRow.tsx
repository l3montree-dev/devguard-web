import { VexRule } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { Row, flexRender } from "@tanstack/react-table";
import { FunctionComponent, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import VexRuleDetailsDialog from "./VexRuleDetailsDialog";

interface VexRulesRowProps {
  row: Row<VexRule>;
  index: number;
  vexRulesInGroup: VexRule[];
  deleteUrlBase: string;
  onDeleted: () => void;
  organizationSlug?: string;
  projectSlug?: string;
  assetSlug?: string;
  assetVersionSlug?: string;
}

const VexRulesRow: FunctionComponent<VexRulesRowProps> = ({
  row,
  index,
  vexRulesInGroup,
  deleteUrlBase,
  onDeleted,
  organizationSlug,
  projectSlug,
  assetSlug,
  assetVersionSlug,
}) => {
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [selectedRule, setSelectedRule] = useState<VexRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const vexSource = row.original.vexSource;

  const handleDeleteGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeletingGroup(true);

    try {
      // Delete all rules in the group one by one
      const deletePromises = vexRulesInGroup.map((rule) =>
        browserApiClient(`${deleteUrlBase}/${rule.id}`, {
          method: "DELETE",
        }),
      );

      await Promise.all(deletePromises);

      toast.success(
        `Deleted ${vexRulesInGroup.length} VEX rule${vexRulesInGroup.length === 1 ? "" : "s"} from source "${vexSource}"`,
      );
      onDeleted();
    } catch (error) {
      toast.error("Failed to delete some VEX rules");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const cellCount = row.getVisibleCells().length;

  return (
    <>
      {/* Group header row - clickable to expand/collapse */}
      <tr
        className={classNames(
          "cursor-pointer hover:bg-muted/50 border-b",
          index % 2 !== 0 && "bg-card/50",
        )}
        onClick={() => setIsGroupOpen((prev) => !prev)}
      >
        {row.getVisibleCells().map((cell, cellIndex) => {
          const isFirstCell = cellIndex === 0;
          const isLastCell = cellIndex === cellCount - 1;

          return (
            <td className="p-4" key={cell.id}>
              {isFirstCell ? (
                <div className="flex items-center gap-2">
                  {isGroupOpen ? (
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium">Source: {vexSource}</span>
                  <Badge variant="outline" className="w-fit">
                    {vexRulesInGroup.length}{" "}
                    {vexRulesInGroup.length === 1 ? "rule" : "rules"}
                  </Badge>
                </div>
              ) : isLastCell ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeletingGroup}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isDeletingGroup ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDeleteGroup}
                      disabled={isDeletingGroup}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete all {vexRulesInGroup.length} rules
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </td>
          );
        })}
      </tr>

      {/* Expanded group rows */}
      {isGroupOpen &&
        vexRulesInGroup.map((vexRule, ruleIndex) => {
          const isLastInGroup = ruleIndex === vexRulesInGroup.length - 1;

          return (
            <tr
              key={vexRule.id}
              className={classNames(
                "relative align-center transition-all cursor-pointer hover:bg-muted/50",
                !isLastInGroup &&
                  "border-b border-gray-100 dark:border-white/5",
              )}
              onClick={() => {
                setSelectedRule(vexRule);
                setIsDialogOpen(true);
              }}
            >
              {row.getVisibleCells().map((cell, cellIndex) => {
                // For the first cell, wrap content with indentation
                const isFirstCell = cellIndex === 0;
                const columnId = cell.column.id;

                // Create a modified row object with the current vexRule
                const modifiedRow = {
                  ...row,
                  original: vexRule,
                  getValue: <TValue,>(id: string): TValue => {
                    return (vexRule as Record<string, unknown>)[id] as TValue;
                  },
                } as Row<VexRule>;

                // Create context with the current vexRule - cast to any to bypass strict typing
                const originalContext = cell.getContext();
                const cellContext = {
                  ...originalContext,
                  row: modifiedRow,
                  getValue: <TValue,>(): TValue => {
                    return (vexRule as Record<string, unknown>)[
                      columnId
                    ] as TValue;
                  },
                } as typeof originalContext;

                return (
                  <td className="p-4" key={cell.id + "-" + vexRule.id}>
                    {isFirstCell ? (
                      <div className="pl-6">
                        {flexRender(cell.column.columnDef.cell, cellContext)}
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cellContext)
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}

      <VexRuleDetailsDialog
        vexRule={selectedRule}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        organizationSlug={organizationSlug}
        projectSlug={projectSlug}
        assetSlug={assetSlug}
        assetVersionSlug={assetVersionSlug}
        urlBase={deleteUrlBase}
        onDeleted={onDeleted}
      />
    </>
  );
};

export default VexRulesRow;
