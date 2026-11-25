// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ReactNode } from "react";

const FormSection = ({
  step,
  title,
  children,
  last,
}: {
  step: number;
  title: string;
  children: ReactNode;
  last?: boolean;
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium">
        {step}
      </div>
      {!last && <div className="mt-1 w-px flex-1 bg-border" />}
    </div>
    <div className="flex-1 pb-6">
      <p className="mb-3 text-sm font-medium leading-none">{title}</p>
      {children}
    </div>
  </div>
);

export default FormSection;
