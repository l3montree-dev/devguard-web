// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useAsset } from "../context/AssetContext";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export function useActiveAsset() {
  return useAsset()!;
}
