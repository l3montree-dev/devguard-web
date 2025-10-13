// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CrossIcon, Loader2, XIcon } from "lucide-react";
import { classNames } from "@/utils/common";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

interface Props {
  onSelect: (item: { value: string; label: string }) => void;
  onRemove: (item: { value: string; label: string }) => void;
  onValueChange?: (value: string) => Promise<void>; // should refetch the items
  items:
    | Array<{
        value: string;
        label: string;
      }>
    | Array<{ value: string; Render: React.ReactNode; label: string }>;
  placeholder: string;
  emptyMessage: string;
  loading?: boolean;
  values: Array<{ value: string; label: string }>; // for multi select
}

export function MultiselectCombobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { loading } = props;

  const selectedValues = React.useMemo(() => {
    return props.values.map((v) => v.value);
  }, [props.values]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="-my-0.5 h-auto min-h-11 w-full min-w-[300px] justify-between"
        >
          <span className="flex-1 flex-wrap flex-row gap-1 flex overflow-hidden overflow-ellipsis text-left">
            {props.values.length === 0 && (
              <span className="text-muted-foreground">{props.placeholder}</span>
            )}
            {props.values.map((v) => (
              <Badge key={v.value} variant={"secondary"}>
                {v.label}
                <XIcon
                  className="ml-2 -mr-1 inline h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onRemove(v);
                  }}
                />
              </Badge>
            ))}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="popover-content-width-same-as-its-trigger min-w-full max-w-full p-0"
      >
        <Command shouldFilter={props.onValueChange === undefined}>
          <CommandInput onValueChange={props.onValueChange} />
          <CommandList>
            {loading && (
              <CommandItem>
                <div className="flex w-full flex-row items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </CommandItem>
            )}
            <CommandEmpty>{props.emptyMessage}</CommandEmpty>
            <CommandGroup>
              {props.items.map((item, i, arr) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  keywords={[item.label]}
                  className={classNames(
                    "text-ellipsis",
                    i !== 0 && i !== arr.length - 1 ? "my-1" : "",
                  )}
                  onSelect={() => {
                    props.onSelect(item);
                  }}
                >
                  <Checkbox
                    checked={selectedValues.includes(item.value)}
                    className="mr-2"
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
// {item.label} is responsible for rendering the text rendering is in CommandItem in
