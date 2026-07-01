"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useRouterQuery from "@/hooks/useRouterQuery";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";

const FRAMEWORK_FILTER_KEY = "filterQuery[framework][is]";
const ALL_FRAMEWORKS = "__all__";

interface Props {
  frameworks: string[];
}

const FrameworkSelect: FunctionComponent<Props> = ({ frameworks }) => {
  const searchParams = useSearchParams();
  const push = useRouterQuery();

  const selected = searchParams?.get(FRAMEWORK_FILTER_KEY) ?? ALL_FRAMEWORKS;

  return (
    <Select
      value={selected}
      onValueChange={(value) =>
        push({
          [FRAMEWORK_FILTER_KEY]: value === ALL_FRAMEWORKS ? undefined : value,
          page: 1,
        })
      }
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="All frameworks" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_FRAMEWORKS}>All frameworks</SelectItem>
        {frameworks.map((framework) => (
          <SelectItem key={framework} value={framework}>
            {framework}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FrameworkSelect;
