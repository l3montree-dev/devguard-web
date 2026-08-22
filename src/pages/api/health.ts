// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { NextApiRequest, NextApiResponse } from "next";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({ status: "ok" });
}
