import {
  FilterForm,
  FilterableColumnDef,
  query2FilterForm,
} from "@/services/filter";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";

import useFilter from "@/hooks/useFilter";
import { FunctionComponent, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Bars3BottomRightIcon } from "@heroicons/react/20/solid";

import { Button, buttonVariants } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";

interface Props {
  columnsDef: FilterableColumnDef[];
}

const Filter: FunctionComponent<Props> = ({ columnsDef }) => {
  const { handleFilter, removeFilter } = useFilter();
  const router = useRouter();
  const form = useForm<FilterForm>();

  const filterableColumns = useMemo(
    () => columnsDef.filter((c): c is FilterableColumnDef => "operators" in c),
    [columnsDef],
  );

  const fieldValue = form.watch("field");

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
        <Button variant={"outline"} key={f.field + f.operator + f.value}>
          <span>
            {f.header} {f.operator} {f.value}
          </span>
          <XMarkIcon className="ml-2 h-4 w-4" />
        </Button>
      ))}
      <Popover>
        <PopoverTrigger className={buttonVariants({ variant: "secondary" })}>
          <Bars3BottomRightIcon className="mr-2 h-4 w-4" />
          Add Filter
        </PopoverTrigger>

        <PopoverContent>
          <Form {...form}>
            <form
              onSubmit={async (e) => {
                await form.handleSubmit(handleFilter)(e);
                form.reset();
              }}
              style={{
                minWidth: "400px",
              }}
              className="flex flex-col gap-4 p-4"
            >
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Column</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a column for filtering" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {columnsDef
                            .filter(
                              (c): c is FilterableColumnDef => "operators" in c,
                            )
                            .map((col) => (
                              <SelectItem
                                key={col.header}
                                value={col.accessorKey}
                              >
                                {col.header}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Based on the selected column different operators can be
                        used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filterColumn?.operators.map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Operators like greater than, equals, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>

                    <FormControl>
                      {filterColumn?.filterValues ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Value" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterColumn?.filterValues.map((op) => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-end">
                <Button variant={"default"}>Add Filter</Button>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Filter;
