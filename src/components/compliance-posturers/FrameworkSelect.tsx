// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Combobox } from "@/components/common/Combobox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";

interface Props {
  frameworks: string[];
}
const FRAMEWORK_FILTER_KEY = "filterQuery[framework][is]";
const ALL_FRAMEWORKS = "__all__";

const FrameworkSelect: FunctionComponent<Props> = ({ frameworks }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedFramework =
    searchParams?.get(FRAMEWORK_FILTER_KEY) ?? ALL_FRAMEWORKS;

  const items = [
    { value: ALL_FRAMEWORKS, label: "All frameworks" },
    ...frameworks.map((framework) => ({
      value: framework,
      label: framework,
    })),
  ];

  return (
    <div className="w-40">
      <Combobox
        data-testid="framework-select"
        items={items}
        value={selectedFramework}
        placeholder="All frameworks"
        emptyMessage="No frameworks found"
        onSelect={(value) => {
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
      />
    </div>
  );
};

export default FrameworkSelect;
