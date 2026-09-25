// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { createPermalinkHandler } from "@/server/permalink";

// /api/-/o/<uuid>/<rest> -> /<organization>/<rest>
export default createPermalinkHandler("orgid");
