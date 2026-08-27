// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent, ReactNode } from "react";
import SkeletonListItem from "./SkeletonListItem";

interface Props {
  title: string;
  description: string;
  Button?: ReactNode;
}
const EmptyParty: FunctionComponent<Props> = ({
  title,
  description,
  Button,
}) => {
  return (
    <div className="relative">
      <div className="mt-5 flex flex-col gap-2 opacity-80">
        <div className="scale-90 blur-sm">
          <SkeletonListItem />
        </div>
        <div className="scale-95 blur-sm">
          <SkeletonListItem />
        </div>
        <div className="scale-90 blur-sm">
          <SkeletonListItem />
        </div>
      </div>
      <div className="absolute top-1/2 w-full -translate-y-1/2 text-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex flex-row justify-center">
          <p className="mt-2 w-2/3 text-muted-foreground">{description}</p>
        </div>
        {Boolean(Button) && <div className="mt-6">{Button}</div>}
      </div>
    </div>
  );
};

export default EmptyParty;
