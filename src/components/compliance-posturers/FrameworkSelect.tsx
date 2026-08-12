"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FunctionComponent } from "react";

interface Props {
  frameworks: string[];
}
const FRAMEWORK_FILTER_KEY = "filterQuery[framework][is]";
const ALL_FRAMEWORKS = "__all__";

const FrameworkSelect: FunctionComponent<Props> = ({ frameworks }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const selectedFramework =
    searchParams?.get(FRAMEWORK_FILTER_KEY) ?? ALL_FRAMEWORKS;

  const options = frameworks.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );
  if (
    selectedFramework !== ALL_FRAMEWORKS &&
    !options.includes(selectedFramework)
  ) {
    options.push(selectedFramework);
  }

  return (
    <Select
      value={selectedFramework}
      onValueChange={(value) => {
        if (!value) {
          return;
        }
        const params = new URLSearchParams(searchParams?.toString());
        if (value === ALL_FRAMEWORKS) {
          params.delete(FRAMEWORK_FILTER_KEY);
        } else {
          params.set(FRAMEWORK_FILTER_KEY, value);
        }
        params.set("page", "1");
        router.push(pathname + "?" + params.toString(), { scroll: false });
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
        {options.map((framework) => (
          <SelectItem key={framework} value={framework}>
            {framework}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FrameworkSelect;
