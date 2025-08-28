import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useActiveProject } from "../hooks/useActiveProject";
import {
  ArtifactDTO,
  CandidatesDTO,
  ReleaseDTO,
  ReleaseItem,
} from "../types/api/api";
import { Modify } from "../types/common";
import { Combobox } from "./common/Combobox";
import Section from "./common/Section";
import { AsyncButton, Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface ReleaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidatesDTO;
  onCreate: (
    release: Modify<
      Omit<ReleaseDTO, "id" | "createdAt" | "updatedAt">,
      {
        items: Omit<ReleaseItem, "id" | "releaseId" | "projectId">[];
      }
    >,
  ) => Promise<any>;
}
const ReleaseDialog = (props: ReleaseDialogProps) => {
  const [selectedArtifacts, setSelectedArtifacts] = useState<ArtifactDTO[]>([]);
  const [selectedReleases, setSelectedReleases] = useState<ReleaseDTO[]>([]);

  const activeProject = useActiveProject();
  const [releaseName, setReleaseName] = useState("");
  const renderedArtifacts = useMemo(
    () =>
      props.candidates.artifacts.map((artifact) => ({
        value:
          artifact.assetId +
          "@" +
          artifact.artifactName +
          "@" +
          artifact.assetVersionName,
        label: artifact.artifactName,
        Render: (
          <div className="flex flex-row items-center">
            {selectedArtifacts.find(
              (a) =>
                a.assetId === artifact.assetId &&
                a.assetVersionName === artifact.assetVersionName &&
                a.artifactName === artifact.artifactName,
            ) && <CheckIcon className="w-4 h-4 mr-1" />}
            {artifact.artifactName}@{artifact.assetVersionName}
          </div>
        ),
      })),
    [props.candidates.artifacts, selectedArtifacts],
  );

  const renderedReleases = useMemo(
    () =>
      props.candidates.releases.map((release) => ({
        value: release.id,
        label: release.name,
        Render: (
          <div className="flex flex-row items-center">
            {selectedReleases.find((r) => r.id === release.id) && (
              <CheckIcon className="w-4 h-4 mr-1" />
            )}
            {release.name}
          </div>
        ),
      })),
    [props.candidates.releases, selectedReleases],
  );

  const handleSelectArtifact = (value: string) => {
    const artifact = props.candidates.artifacts.find(
      (a) =>
        a.assetId + "@" + a.artifactName + "@" + a.assetVersionName === value,
    );
    if (artifact) {
      setSelectedArtifacts((prev) => {
        // check if artifact is already selected
        const index = prev.findIndex(
          (a) =>
            a.assetId === artifact.assetId &&
            a.assetVersionName === artifact.assetVersionName &&
            a.artifactName === artifact.artifactName,
        );
        if (index !== -1) {
          // artifact is already selected, remove it
          const newSelected = [...prev];
          newSelected.splice(index, 1);
          return newSelected;
        }
        // artifact is not selected, add it
        return [...prev, artifact];
      });
    }
  };

  const handleSelectRelease = (value: string) => {
    const release = props.candidates.releases.find((r) => r.id === value);
    if (release) {
      setSelectedReleases((prev) => {
        // check if release is already selected
        const index = prev.findIndex((r) => r.id === release.id);
        if (index !== -1) {
          // release is already selected, remove it
          const newSelected = [...prev];
          newSelected.splice(index, 1);
          return newSelected;
        }
        // release is not selected, add it
        return [...prev, release];
      });
    }
  };

  const handleRemoveArtifact = (artifact: ArtifactDTO) => {
    setSelectedArtifacts((prev) =>
      prev.filter(
        (a) =>
          !(
            a.assetId === artifact.assetId &&
            a.assetVersionName === artifact.assetVersionName &&
            a.artifactName === artifact.artifactName
          ),
      ),
    );
  };

  const handleRemoveRelease = (release: ReleaseDTO) => {
    setSelectedReleases((prev) => prev.filter((r) => r.id !== release.id));
  };

  const handleCreateRelease = async () => {
    if (releaseName.trim() === "") {
      toast.error("Release name cannot be empty");
      return;
    }
    await props.onCreate({
      name: releaseName,
      projectId: activeProject?.id || "",
      items: selectedArtifacts
        .map(
          (artifact) =>
            ({
              artifactName: artifact.artifactName,
              assetId: artifact.assetId,
              assetVersionName: artifact.assetVersionName,
            }) as Omit<ReleaseItem, "id" | "releaseId" | "projectId">,
        )
        .concat(
          selectedReleases.map((release) => ({
            childReleaseId: release.id,
          })),
        ),
    });
  };
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Release</DialogTitle>
          <DialogDescription>
            You can select one or more artifacts to include in this release.
            Besides that, you can also create a release based on other releases
            - combining their artifacts into a new release.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="mb-10">
            <label className="mb-2 mt-4 block font-medium" htmlFor="name">
              Release Name
            </label>
            <Input
              value={releaseName}
              onChange={(e) => setReleaseName(e.target.value)}
              placeholder="Release name like pkg:maven/org.apache.commons/commons-lang3@3.12.0"
              className="w-full"
            />
          </div>
          <Section
            description="Select one or more artifacts of Child-Repositories to include in this release."
            forceVertical
            title="Select Artifacts to include"
          >
            <Combobox
              onSelect={handleSelectArtifact}
              placeholder="Select artifacts"
              emptyMessage="No artifacts found"
              multiSelect
              alwaysRenderPlaceholder
              items={renderedArtifacts}
            ></Combobox>
          </Section>
          <Section
            forceVertical
            title="Or select existing Releases to include"
            description="Compose this release from other releases or subgroup releases, combining their artifacts."
          >
            <Combobox
              onSelect={handleSelectRelease}
              placeholder="Select existing releases"
              emptyMessage="No releases found"
              alwaysRenderPlaceholder
              multiSelect
              items={renderedReleases}
            ></Combobox>
          </Section>

          <Section
            description="Overview of the artifacts and releases selected to be included in this new release."
            forceVertical
            title="Release Content"
          >
            {selectedArtifacts.length === 0 &&
              selectedReleases.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No artifacts or releases selected yet.
                </div>
              )}
            <div className="flex flex-col gap-2 mb-4">
              {selectedArtifacts.map((artifact) => (
                <div
                  className="text-sm bg-card flex gap-2 items-center flex-row p-2 pl-4 rounded-md whitespace-nowrap overflow-hidden block"
                  key={artifact.assetId + "@" + artifact.assetVersionName}
                >
                  <span className="flex-1 text-ellipsis overflow-hidden">
                    {artifact.artifactName}@{artifact.assetVersionName}
                  </span>
                  <Button
                    onClick={() => handleRemoveArtifact(artifact)}
                    variant={"outline"}
                    size={"xsicon"}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {selectedReleases.map((release) => (
                <div
                  className="text-sm flex gap-2 items-center flex-row p-2 pl-4 rounded-md bg-card whitespace-nowrap overflow-hidden block"
                  key={release.id}
                >
                  <span className="flex-1 text-ellipsis overflow-hidden">
                    {release.name}
                  </span>
                  <Button
                    onClick={() => handleRemoveRelease(release)}
                    variant={"outline"}
                    size={"xsicon"}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={props.onClose}>
            Cancel
          </Button>
          <AsyncButton onClick={handleCreateRelease} type="submit">
            Create Release
          </AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseDialog;
