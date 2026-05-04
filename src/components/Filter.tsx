// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useState } from "react";
import type { FunctionComponent } from "react";
import { useSearchParams } from "next/navigation";
import type { FilterForm } from "@/services/filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  operators: Array<{ value: string; label?: string }>;
  filterValues?: Array<{ value: string; label?: string }>;
}

interface Props {
  options: FilterOption[];
  onFilter: (data: FilterForm) => void;
  onRemoveFilter: (f: FilterForm) => void;
  onClearAllFilters?: () => void;
  search?: {
    onChange: (value: string) => void;
    defaultValue?: string;
    placeholder?: string;
  };
}

type Step = "label" | "operator" | "value";

const Filter: FunctionComponent<Props> = ({
  options,
  onFilter,
  onRemoveFilter,
  onClearAllFilters,
  search,
}) => {
  const searchParams = useSearchParams();

  // Search-input popover state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("label");
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [inputQuery, setInputQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>(
    search?.defaultValue ?? "",
  );

  useEffect(() => {
    setActiveSearchQuery(search?.defaultValue ?? "");
  }, [search?.defaultValue]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Filter-button popover state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState<string>(
    options[0]?.value ?? "",
  );
  const [filterOperator, setFilterOperator] = useState<string>("");
  const [filterValueInput, setFilterValueInput] = useState<string>("");

  const activeFilters: FilterForm[] = [];
  searchParams?.forEach((value, key) => {
    const match = key.match(/filterQuery\[(.*)\]\[(.*)\]/);
    if (match) {
      activeFilters.push({ field: match[1], operator: match[2], value });
    }
  });

  const selectedOption = options.find((o) => o.value === selectedField);
  const operators = selectedOption?.operators ?? [];

  const showFilterValues =
    selectedOption?.filterValues &&
    (selectedOperator === "is" || selectedOperator === "is not");

  const filteredOptions = inputQuery
    ? options.filter((o) =>
        o.label.toLowerCase().includes(inputQuery.toLowerCase()),
      )
    : options;

  const getFieldLabel = (fieldValue: string) =>
    options.find((o) => o.value === fieldValue)?.label ?? fieldValue;

  const getOperatorLabel = (fieldValue: string, operatorValue: string) =>
    options
      .find((o) => o.value === fieldValue)
      ?.operators.find((op) => op.value === operatorValue)?.label ??
    operatorValue;

  // ── Search-input handlers ──────────────────────────────────────────────────

  const handleInputFocus = () => {
    setStep("label");
    setSelectedField("");
    setSelectedOperator("");
    setFilterValue("");
    setOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(e.target.value);
    setFocusedIndex(-1);
    if (step === "label") setOpen(true);
  };

  const handleSearchForText = () => {
    search?.onChange(inputQuery);
    setActiveSearchQuery(inputQuery);
    setInputQuery("");
    setOpen(false);
  };

  const handleRemoveSearchQuery = () => {
    search?.onChange("");
    setActiveSearchQuery("");
  };

  const handleSelectLabel = (value: string) => {
    const option = options.find((o) => o.value === value);
    setSelectedField(value);
    setInputQuery("");
    if (option?.operators.length === 1) {
      setSelectedOperator(option.operators[0].value);
      setStep("value");
    } else {
      setStep("operator");
    }
  };

  const handleSelectOperator = (op: string) => {
    setSelectedOperator(op);
    setStep("value");
  };

  const handleApplyValue = (value: string) => {
    if (!selectedField || !selectedOperator || !value) return;
    onFilter({ field: selectedField, operator: selectedOperator, value });
    setOpen(false);
    setStep("label");
    setSelectedField("");
    setSelectedOperator("");
    setFilterValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (
      e.key === "Enter" &&
      step === "label" &&
      focusedIndex === -1 &&
      inputQuery
    ) {
      e.preventDefault();
      handleSearchForText();
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }

    if (e.key === "Backspace" && inputQuery === "" && step !== "label") {
      e.preventDefault();
      setStep(step === "value" ? "operator" : "label");
      setFocusedIndex(-1);
      return;
    }

    let itemCount = 0;
    if (step === "label") {
      itemCount = filteredOptions.length + (inputQuery && search ? 1 : 0);
    } else if (step === "operator") {
      itemCount = operators.length;
    } else if (step === "value" && showFilterValues) {
      itemCount = selectedOption?.filterValues?.length ?? 0;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, itemCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      if (step === "label") {
        if (focusedIndex < filteredOptions.length) {
          handleSelectLabel(filteredOptions[focusedIndex].value);
        } else {
          handleSearchForText();
        }
      } else if (step === "operator") {
        handleSelectOperator(operators[focusedIndex].value);
      } else if (step === "value" && showFilterValues) {
        handleApplyValue(
          selectedOption?.filterValues?.[focusedIndex]?.value ?? "",
        );
      }
      setFocusedIndex(-1);
    }
  };

  // ── Filter-button handlers ─────────────────────────────────────────────────

  const filterOption = options.find((o) => o.value === filterField);
  const filterOperators = filterOption?.operators ?? [];
  const filterValues = filterOption?.filterValues;

  const handleFilterFieldChange = (v: string) => {
    const option = options.find((o) => o.value === v);
    setFilterField(v);
    setFilterOperator(
      option?.operators.length === 1 ? option.operators[0].value : "",
    );
    setFilterValueInput("");
  };

  const handleApplyFilter = () => {
    if (!filterField || !filterOperator || !filterValueInput) return;
    onFilter({
      field: filterField,
      operator: filterOperator,
      value: filterValueInput,
    });
    setFilterOperator("");
    setFilterValueInput("");
    setFilterOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        {/* Search input with step popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <Input
              onFocus={handleInputFocus}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              value={inputQuery}
              placeholder={search?.placeholder ?? "Search or filter results..."}
            />
          </PopoverAnchor>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {step === "label" && (
              <div>
                {filteredOptions.length > 0 && (
                  <>
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      Filter by
                    </p>
                    {filteredOptions.map((opt, i) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectLabel(opt.value)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${focusedIndex === i ? "bg-accent" : ""}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </>
                )}
                {inputQuery && search && (
                  <button
                    onClick={handleSearchForText}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent ${focusedIndex === filteredOptions.length ? "bg-accent" : ""}`}
                  >
                    <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    Search for &ldquo;{inputQuery}&rdquo;
                  </button>
                )}
              </div>
            )}

            {step === "operator" && (
              <div>
                <button
                  onClick={() => setStep("label")}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                  {getFieldLabel(selectedField)}
                </button>
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  Operator
                </p>
                {operators.map((op, i) => (
                  <button
                    key={op.value}
                    onClick={() => handleSelectOperator(op.value)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${focusedIndex === i ? "bg-accent" : ""}`}
                  >
                    {op.label ?? op.value}
                  </button>
                ))}
              </div>
            )}

            {step === "value" && (
              <div>
                <button
                  onClick={() => setStep("operator")}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                  {getFieldLabel(selectedField)}{" "}
                  {getOperatorLabel(selectedField, selectedOperator)}
                </button>
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  Value
                </p>
                {showFilterValues ? (
                  selectedOption?.filterValues?.map((v, i) => (
                    <button
                      key={v.value}
                      onClick={() => handleApplyValue(v.value)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${focusedIndex === i ? "bg-accent" : ""}`}
                    >
                      {v.label ?? v.value}
                    </button>
                  ))
                ) : (
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <Input
                      autoFocus
                      placeholder="Enter value..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyValue(filterValue);
                      }}
                    />
                    <Button
                      variant="ghost"
                      className="h-12"
                      onClick={() => handleApplyValue(filterValue)}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Filter button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="h-10 gap-1.5">
              <FilterIcon className="h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Add filter</p>
              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <Select value={filterField} onValueChange={handleFilterFieldChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterOperator} onValueChange={setFilterOperator}>
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {filterOperators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label ?? op.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterValues &&
            (filterOperator === "is" || filterOperator === "is not") ? (
              <Select
                value={filterValueInput}
                onValueChange={setFilterValueInput}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {filterValues.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label ?? v.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Value"
                value={filterValueInput}
                onChange={(e) => setFilterValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyFilter();
                }}
              />
            )}
            <div className="flex gap-2">
              {(activeFilters.length > 0 || activeSearchQuery) && (
                <Button
                  className="flex-1"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onClearAllFilters) {
                      onClearAllFilters();
                    } else {
                      activeFilters.forEach((f) => onRemoveFilter(f));
                    }
                    handleRemoveSearchQuery();
                    setFilterOpen(false);
                  }}
                >
                  Clear all
                </Button>
              )}
              <Button
                className="flex-1"
                variant="ghost"
                size="sm"
                onClick={handleApplyFilter}
                disabled={!filterField || !filterOperator || !filterValueInput}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(activeFilters.length > 0 || activeSearchQuery) && (
        <div className="flex flex-row flex-wrap items-center gap-2">
          {activeSearchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1 pr-1">
              <SearchIcon className="h-3 w-3" />
              <span>&ldquo;{activeSearchQuery}&rdquo;</span>
              <button
                onClick={handleRemoveSearchQuery}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                aria-label="Remove search"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.map((f) => (
            <Badge
              key={`${f.field}-${f.operator}`}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>
                {getFieldLabel(f.field)} {getOperatorLabel(f.field, f.operator)}{" "}
                &ldquo;{f.value}&rdquo;
              </span>
              <button
                onClick={() => onRemoveFilter(f)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                aria-label="Remove filter"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filter;
