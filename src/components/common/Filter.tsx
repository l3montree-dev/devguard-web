import {
  FilterForm,
  FilterableColumnDef,
  query2FilterForm,
} from "@/services/filter";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";

import useFilter from "@/hooks/useFilter";
import { FunctionComponent, useMemo } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import Input from "./Input";
import PopupMenu from "./PopupMenu";
import Select from "./Select";
import { useRouter } from "next/router";
import { Bars3BottomRightIcon } from "@heroicons/react/20/solid";

interface Props {
  columnsDef: FilterableColumnDef[];
}

const Filter: FunctionComponent<Props> = ({ columnsDef }) => {
  const { handleFilter, removeFilter } = useFilter();
  const router = useRouter();
  const { register, handleSubmit, formState, watch, reset } =
    useForm<FilterForm>();

  const filterableColumns = useMemo(
    () => columnsDef.filter((c): c is FilterableColumnDef => "operators" in c),
    [columnsDef],
  );

  const fieldValue = watch("field");

  const filterColumn = useMemo(
    () => filterableColumns.find((c) => c.accessorKey === fieldValue),
    [fieldValue, filterableColumns],
  );

  const appliedFilters = useMemo(
    () =>
      query2FilterForm(router.query)
        .map((f) => {
          // lookup the column
          const col = filterableColumns.find((c) => c.accessorKey === f.field);

          if (!col) {
            return null;
          }

          return {
            ...f,
            header: col.header,
          };
        })
        .filter((f) => f !== null) as Array<FilterForm & { header: string }>,
    [filterableColumns, router.query],
  );

  return (
    <div className="flex flex-row gap-2">
      {appliedFilters.map((f) => (
        <div
          key={f.field + f.operator + f.value}
          className="flex flex-row items-center gap-2 rounded-lg border p-2 text-sm font-semibold shadow-sm dark:border-gray-500 dark:text-white"
        >
          <span>
            {f.header} {f.operator} {f.value}
          </span>
          <button onClick={() => removeFilter(f)}>
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
      <PopupMenu
        Button={
          <Button
            Icon={<Bars3BottomRightIcon />}
            variant="outline"
            intent="primary"
          >
            Add Filter
          </Button>
        }
      >
        <form
          onSubmit={async (e) => {
            await handleSubmit(handleFilter)(e);
            reset();
          }}
          style={{
            minWidth: "400px",
          }}
          className="flex flex-col gap-4 p-4"
        >
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Select
                {...register("field", {
                  required: "This field is required",
                })}
                label="Field"
              >
                <option value={undefined}>Select a field</option>
                {columnsDef
                  .filter((c): c is FilterableColumnDef => "operators" in c)
                  .map((col) => (
                    <option value={col.accessorKey} key={col.header}>
                      {col.header}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="flex-1">
              <Select
                {...register("operator", {
                  required: "This field is required",
                })}
                disabled={!Boolean(filterColumn)}
                label="Operator"
              >
                <option value={""}>Select an operator</option>
                {filterColumn?.operators.map((op) => (
                  <option value={op} key={op}>
                    {op}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {Boolean(filterColumn) && (
            <div>
              {filterColumn?.filterValues ? (
                <Select
                  {...register("value", {
                    required: "This field is required",
                    validate: (v) => v.length > 0,
                  })}
                  disabled={!Boolean(filterColumn)}
                  label="Value"
                >
                  <option value={""}>Select a value</option>
                  {filterColumn.filterValues.map((op) => (
                    <option value={op} key={op}>
                      {op}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  {...register("value")}
                  type="number"
                  disabled={!Boolean(filterColumn)}
                  label="Value"
                />
              )}
            </div>
          )}
          <div className="flex flex-row justify-end">
            <Button
              disabled={!formState.isValid}
              type="submit"
              intent="primary"
            >
              Add Filter
            </Button>
          </div>
        </form>
      </PopupMenu>
    </div>
  );
};

export default Filter;
