import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useActiveAsset } from "../../hooks/useActiveAsset";
import { useUpdateAsset } from "../../context/AssetContext";
import { browserApiClient } from "../../services/devGuardApi";

export function usePublicSharing() {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const updateAsset = useUpdateAsset();
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  const sharesInformation = asset?.sharesInformation ?? false;

  const handleTogglePublic = async (value: boolean) => {
    setIsPublicLoading(true);
    try {
      const resp = await browserApiClient(
        `/organizations/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}`,
        {
          method: "PATCH",
          body: JSON.stringify({ sharesInformation: value }),
        },
      );
      if (resp.ok) {
        const updated = await resp.json();
        updateAsset(updated);
      } else {
        toast.error("Failed to update public access setting.");
      }
    } catch {
      toast.error("Failed to update public access setting.");
    } finally {
      setIsPublicLoading(false);
    }
  };

  return { sharesInformation, isPublicLoading, handleTogglePublic };
}

function PublicUrlBox({
  url,
  sharesInformation,
  toastLabel,
}: {
  url: string;
  sharesInformation: boolean;
  toastLabel: string;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast("Copied to clipboard", {
      description: `The ${toastLabel} has been copied to your clipboard.`,
    });
  };

  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border dark:border-foreground/20 bg-background px-3 py-2 text-sm transition-opacity ${!sharesInformation ? "opacity-40" : ""}`}
    >
      <span className="truncate text-foreground flex-1 min-w-0">{url}</span>
      {sharesInformation && url && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${toastLabel} to clipboard`}
          className="ml-2 shrink-0 cursor-pointer transition-all hover:opacity-100"
        >
          <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function PublicUrlSection({
  sharesInformation,
  isPublicLoading,
  onToggle,
  selectedArtifact,
  assetVersionSlug,
  assetId,
  devguardApiUrl,
  fileType,
  toastLabel,
}: {
  sharesInformation: boolean;
  isPublicLoading: boolean;
  onToggle: (value: boolean) => void;
  selectedArtifact?: string;
  assetVersionSlug?: string;
  assetId?: string;
  devguardApiUrl: string;
  fileType: "vex.json" | "sbom.json";
  toastLabel: string;
}) {
  const url =
    selectedArtifact && assetVersionSlug && assetId
      ? `${devguardApiUrl}/api/v1/public/${assetId}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}/${fileType}/`
      : "";

  return (
    <div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-semibold" id="public-url">
          Public URL
        </span>
        <Switch
          aria-labelledby="public-url"
          checked={sharesInformation}
          onCheckedChange={onToggle}
          disabled={isPublicLoading}
          className="scale-75 origin-right"
        />
      </div>
      <p className="text-sm mb-4 text-muted-foreground">
        Enabling this makes the asset&apos;s public SBOM and VEX information
        available for all artifacts.
      </p>
      {selectedArtifact ? (
        <PublicUrlBox
          url={url}
          sharesInformation={sharesInformation}
          toastLabel={toastLabel}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Select a named artifact above to see its public URL.
        </p>
      )}
    </div>
  );
}
