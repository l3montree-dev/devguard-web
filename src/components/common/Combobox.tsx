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
import { Loader2 } from "lucide-react";

interface Props {
  onSelect: (value: string) => void;
  onValueChange?: (value: string) => Promise<void>; // should refetch the items
  items: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  emptyMessage: string;
  loading?: boolean;
  value?: string;
}

export function Combobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.value ?? "");
  const { loading } = props;

  const handleValueChange = (value: string) => {
    if (props.onValueChange) {
      props.onValueChange(value);
    }
    setValue(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="-my-0.5 h-11 w-full min-w-[300px] justify-between"
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
        <Command shouldFilter={props.onValueChange === undefined}>
          <CommandInput
            onValueChange={handleValueChange}
            placeholder={props.placeholder}
          />

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
                  {item.value.startsWith("gitlab") ? (
                    <img
                      className="mr-2 inline-block h-4 w-4"
                      src="/assets/gitlab.svg"
                      alt="GitLab"
                    />
                  ) : item.value.startsWith("github") ? (
                    <img
                      className="mr-2 inline-block h-4 w-4"
                      src="/assets/github.svg"
                      alt="GitHub"
                    />
                  ) : null}

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
