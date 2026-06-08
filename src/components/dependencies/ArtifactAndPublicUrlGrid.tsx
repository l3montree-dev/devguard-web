import type { ArtifactDTO } from "../../types/api/api";
import { SimpleArtifactSelector } from "../ArtifactSelector";
import AuthGuard from "../AuthGuard";
import { PublicUrlSection } from "./PublicUrlSection";

interface ArtifactAndPublicUrlGridProps {
  artifacts: Array<ArtifactDTO>;
  selectedArtifact: string | undefined;
  onSelect: (artifact: string | undefined) => void;
  sharesInformation: boolean;
  isPublicLoading: boolean;
  onToggle: (value: boolean) => void;
  assetVersionSlug?: string;
  assetId?: string;
  devguardApiUrl: string;
  fileType: "vex.json" | "sbom.json";
  toastLabel: string;
}

export function ArtifactAndPublicUrlGrid({
  artifacts,
  selectedArtifact,
  onSelect,
  sharesInformation,
  isPublicLoading,
  onToggle,
  assetVersionSlug,
  assetId,
  devguardApiUrl,
  fileType,
  toastLabel,
}: ArtifactAndPublicUrlGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="pr-6">
        <h4 className="font-semibold mt-4">Artifact</h4>
        <p className="text-sm mb-4 text-muted-foreground">
          Select the artifact for which you want to download the{" "}
          {fileType === "sbom.json" ? "SBOM" : "VEX"}.
        </p>
        <SimpleArtifactSelector
          unassignPossible={false}
          artifacts={(artifacts ?? []).map((a) => a.artifactName)}
          selectedArtifact={selectedArtifact}
          onSelect={onSelect}
        />
      </div>
      <AuthGuard require="admin">
        <div className="pl-4">
          <PublicUrlSection
            sharesInformation={sharesInformation}
            isPublicLoading={isPublicLoading}
            onToggle={onToggle}
            selectedArtifact={selectedArtifact}
            assetVersionSlug={assetVersionSlug}
            assetId={assetId}
            devguardApiUrl={devguardApiUrl}
            fileType={fileType}
            toastLabel={toastLabel}
          />
        </div>
      </AuthGuard>
    </div>
  );
}
