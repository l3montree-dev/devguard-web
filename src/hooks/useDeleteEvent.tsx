import { browserApiClient } from "@/services/devGuardApi";
import useDecodedParams from "./useDecodedParams";
import { toast } from "sonner";

export const useDeleteEvent = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams();

  return async (eventId: string) => {
    const resp = await browserApiClient(
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
