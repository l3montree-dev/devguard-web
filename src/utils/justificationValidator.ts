// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { toast } from "@/lib/toast";
import type { VulnEventDTO } from "@/types/view/vulnEvents";

export const MAX_JUSTIFICATION_LENGTH = 4000;

export function validateJustification(
  justification: string | undefined,
  status?: VulnEventDTO["type"],
): boolean {
  const isComment = status === "comment";

  if (!justification?.trim()) {
    toast.warning(
      isComment ? "Comment can’t be empty" : "Justification required",
      {
        description: isComment
          ? "Write a comment before posting."
          : status === "mitigate"
            ? "Add a justification before creating this ticket."
            : "Add a justification before recording this decision.",
      },
    );
    return false;
  }

  if (justification.length > MAX_JUSTIFICATION_LENGTH) {
    toast.warning(
      isComment ? "Comment is too long" : "Justification is too long",
      {
        description: `Please keep it under ${MAX_JUSTIFICATION_LENGTH} characters.`,
      },
    );
    return false;
  }

  return true;
}
