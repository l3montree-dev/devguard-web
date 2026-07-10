"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import useRouterQuery from "@/hooks/useRouterQuery";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FunctionComponent } from "react";

interface Props {
  frameworks: string[];
}

const FrameworkSelect: FunctionComponent<Props> = ({ frameworks }) => {
  const FRAMEWORK_FILTER_KEY = "filterQuery[framework][is]";
  const ALL_FRAMEWORKS = "__all__";
  const LOCAL_STORAGE_KEY = "compliance-framework-filter";

  const searchParams = useSearchParams();
  const push = useRouterQuery();
  const [search, setSearch] = useState("");

  const selected = searchParams?.get(FRAMEWORK_FILTER_KEY) ?? ALL_FRAMEWORKS;

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved && saved !== ALL_FRAMEWORKS) {
      push({ [FRAMEWORK_FILTER_KEY]: saved, page: 1 });
    }
  }, []);

  const filtered = frameworks.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        if (value === ALL_FRAMEWORKS) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, value);
        }
        push({
          [FRAMEWORK_FILTER_KEY]: value === ALL_FRAMEWORKS ? undefined : value,
          page: 1,
        });
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="All frameworks" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Search frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <SelectItem value={ALL_FRAMEWORKS}>All frameworks</SelectItem>
        {filtered.map((framework) => (
          <SelectItem key={framework} value={framework}>
            {framework}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FrameworkSelect;
