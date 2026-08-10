"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useRouterQuery from "@/hooks/useRouterQuery";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FunctionComponent,
} from "react";

interface Props {
  frameworks: string[];
}
const FRAMEWORK_FILTER_KEY = "filterQuery[framework][is]";
const ALL_FRAMEWORKS = "__all__";
const LOCAL_STORAGE_KEY = "compliance-framework-filter";

const subscribeToStorage = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
};

const FrameworkSelect: FunctionComponent<Props> = ({ frameworks }) => {
  const searchParams = useSearchParams();

  const push = useRouterQuery();
  const [search, setSearch] = useState("");

  const stored = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem(LOCAL_STORAGE_KEY),
    () => null,
  );

  const fromUrl = searchParams?.get(FRAMEWORK_FILTER_KEY);
  const selectedFramework = fromUrl ?? stored ?? ALL_FRAMEWORKS;

  useEffect(() => {
    if (!fromUrl && stored) {
      push({ [FRAMEWORK_FILTER_KEY]: stored, page: 1 });
    }
  }, [fromUrl, stored, push]);

  const filtered = frameworks.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Select
      value={selectedFramework}
      onValueChange={(value) => {
        if (value === ALL_FRAMEWORKS) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, value);
        }
        window.dispatchEvent(new Event("storage"));
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
