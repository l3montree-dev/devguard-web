// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { createPermalinkHandler } from "@/server/permalink";

// /api/-/p/<uuid>/<rest> -> /<organization>/projects/<project>/<rest>
export default createPermalinkHandler("projectid");
