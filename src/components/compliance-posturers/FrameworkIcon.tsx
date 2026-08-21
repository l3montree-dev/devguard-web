// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { classNames } from "@/utils/common";
import { ShieldCheck } from "lucide-react";
import type { FunctionComponent } from "react";

interface Props {
  framework: string;
  className?: string;
}

const FrameworkIcon: FunctionComponent<Props> = ({ framework, className }) => {
  return (
    <ShieldCheck
      className={classNames(
        "h-4 w-4 shrink-0 text-muted-foreground",
        className,
      )}
      aria-hidden
    />
  );
};

export default FrameworkIcon;
