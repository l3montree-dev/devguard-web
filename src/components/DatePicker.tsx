"use client";

import { addYears, format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  label?: string;
  onDateChange: (date: Date | undefined) => void;
}

const DATE_FORMAT = "dd/MM/yyyy";

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [inputValue, setInputValue] = useState(
    date ? format(date, DATE_FORMAT) : "",
  );

  useEffect(() => {
    setInputValue(date ? format(date, DATE_FORMAT) : "");
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === "") {
      onDateChange(undefined);
      return;
    }
    const parsed = parse(val, DATE_FORMAT, new Date());
    if (isValid(parsed) && val.length === DATE_FORMAT.length) {
      onDateChange(parsed);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={format(new Date(), DATE_FORMAT)}
        className="w-[120px] font-normal tabular-nums"
        maxLength={10}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            defaultMonth={date ?? new Date()}
            disabled={(d) =>
              d < new Date(new Date().setHours(0, 0, 0, 0)) ||
              d > addYears(new Date(), 1)
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
