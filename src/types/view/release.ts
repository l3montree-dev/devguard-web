// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";

// Every field is a pointer with omitempty in Go and the validation is
// required_without: an item references either an artifact or a child release.
export type ReleaseItem = Partial<components["schemas"]["dtos.ReleaseItemDTO"]>;
