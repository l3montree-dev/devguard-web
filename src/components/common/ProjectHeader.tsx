// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { useProjectMenu } from "@/hooks/useProjectMenu";
import DynamicHeader from "./DynamicHeader";
import ProjectTitle from "./ProjectTitle";

export default function ProjectHeader() {
  const menu = useProjectMenu();

  return <DynamicHeader z={3} Title={<ProjectTitle />} menu={menu} />;
}
