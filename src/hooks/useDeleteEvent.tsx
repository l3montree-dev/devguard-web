// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { apiFetch } from "@/services/apiClient";
import useDecodedParams from "./useDecodedParams";
import { toast } from "@/lib/toast";

export const useDeleteEvent = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams();

  return async (eventId: string) => {
    const resp = await apiFetch(
      `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/events/${eventId}`,
      { method: "DELETE" },
    );
    if (!resp.ok) {
      toast.error("Failed to delete event", {
        description: "Please try again later.",
      });
    } else {
      toast.success("Event deleted successfully");
    }
    return resp;
  };
};
