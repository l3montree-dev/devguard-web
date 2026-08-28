// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import SkeletonListItem from "./SkeletonListItem";

interface Props {
  variant?: "card" | "project";
}
const SkeletonListItems: FunctionComponent<Props> = ({ variant }) => {
  return (
    <>
      <SkeletonListItem variant={variant} />
      <SkeletonListItem variant={variant} />
      <SkeletonListItem variant={variant} />
    </>
  );
};

export default SkeletonListItems;
