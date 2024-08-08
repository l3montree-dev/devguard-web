// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface Props {
  onSelect: (value: string) => void;
  items: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  emptyMessage: string;
  value?: string;
}

export function Combobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.value ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-[300px] justify-between"
        >
          <span className="flex-1 overflow-hidden overflow-ellipsis text-left">
            {value
              ? props.items.find((item) => item.value === value)?.label
              : props.placeholder}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={props.placeholder} />
          <CommandList>
            <CommandEmpty>{props.emptyMessage}</CommandEmpty>
            <CommandGroup>
              {props.items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  keywords={[item.label]}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    props.onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    )}
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
