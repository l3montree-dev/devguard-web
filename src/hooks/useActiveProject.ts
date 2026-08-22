// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useProject } from "../context/ProjectContext";

export function useActiveProject() {
  const projectContext = useProject();
  return projectContext!;
}
