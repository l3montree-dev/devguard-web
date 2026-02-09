// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import AssetTitle from "@/components/common/AssetTitle";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { documentationLinks } from "@/const/documentationLinks";
import { useSession } from "@/context/SessionContext";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import {
  ArtifactCreateUpdateRequest,
  ArtifactDTO,
  ExternalReferenceErrorDTO,
  InformationSources,
} from "@/types/api/api";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import ArtifactRow from "../../../../../../../../../../components/artifacts/ArtifactRow";
import { BranchTagSelector } from "../../../../../../../../../../components/BranchTagSelector";
import ArtifactDialog from "../../../../../../../../../../components/common/ArtifactDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../../../../../../../components/ui/alert-dialog";
import {
  useArtifacts,
  useUpdateAssetVersionState,
} from "../../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import { useAssetBranchesAndTags } from "../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";

const Artifacts = () => {
  const assetMenu = useAssetMenu();
  const { session } = useSession();

  const artifacts = useArtifacts();

  const updateAssetVersionState = useUpdateAssetVersionState();

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    artifact: ArtifactDTO | null;
  }>({
    isOpen: false,
    mode: "create",
    artifact: null,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<ArtifactDTO | null>(
    null,
  );

  const [selectedSourceUrls, setSelectedSourceUrls] = useState<Set<string>>(
    new Set(),
  );

  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug: string;
  };

  const { data: rootNodes, mutate } = useSWR<{
    [artifactName: string]: InformationSources[];
  }>(
    "/organizations/" +
      params.organizationSlug +
      "/projects/" +
      params.projectSlug +
      "/assets/" +
      params.assetSlug +
      "/refs/" +
      params.assetVersionSlug +
      "/artifact-root-nodes",
    fetcher,
    {
      fallbackData: {},
    },
  );

  const artifactForm = useForm<ArtifactCreateUpdateRequest>({
    defaultValues: {
      artifactName: "",
      informationSources: [],
    },
  });

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const openCreateDialog = () => {
    setDialogState({
      isOpen: true,
      mode: "create",
      artifact: null,
    });
    artifactForm.reset({
      artifactName: "",
      informationSources: [],
    });
  };

  const openEditDialog = (artifact: ArtifactDTO) => {
    setDialogState({
      isOpen: true,
      mode: "edit",
      artifact: artifact,
    });
    artifactForm.reset({
      artifactName: artifact.artifactName,
      informationSources:
        rootNodes && artifact.artifactName in rootNodes
          ? rootNodes[artifact.artifactName]
          : [],
    });
  };

  const closeDialog = () => {
    setDialogState({
      isOpen: false,
      mode: "create",
      artifact: null,
    });
    artifactForm.reset();
  };

  const handleSubmit = async (data: ArtifactCreateUpdateRequest) => {
    let success = false;

    if (dialogState.mode === "create") {
      success = await createArtifact(data);
    } else if (dialogState.mode === "edit" && dialogState.artifact) {
      success = await updateArtifact({
        artifactName: data.artifactName,
        informationSources: data.informationSources,
      });
    }

    if (success) {
      mutate();
      closeDialog();
    }
  };

  const handleDelete = async () => {
    if (deleteDialogOpen) {
      const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(deleteDialogOpen.artifactName)}/`;
      const resp = await browserApiClient(url, { method: "DELETE" });
      if (!resp.ok) {
        toast.error("Failed to delete artifact: " + resp.statusText);
        return;
      }
      updateAssetVersionState((prev) => ({
        ...prev!,
        artifacts: prev!.artifacts.filter(
          (a) => a.artifactName != deleteDialogOpen.artifactName,
        ),
      }));

      toast.success("Artifact deleted");
      setDeleteDialogOpen(null);
    }
  };

  const syncExternalSources = async (artifactName: string) => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifactName)}/sync-external-sources/`;
    const resp = await browserApiClient(url, { method: "POST" });
    if (!resp.ok) {
      toast.error("Failed to sync external sources: " + resp.statusText);
      return;
    }

    toast.success("External sources synced. Reload required to see updates.");
  };

  const createArtifact = async (
    data: ArtifactCreateUpdateRequest,
  ): Promise<boolean> => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/`;
    const resp = await browserApiClient(url, {
      method: "POST",
      body: JSON.stringify({
        artifactName: data.artifactName,
        informationSources: data.informationSources || [],
      }),
    });

    if (!resp.ok) {
      toast.error("Failed to create artifact: " + resp.statusText);
      return false;
    }

    const newArtifact = await resp.json();
    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: [...prev!.artifacts, newArtifact],
    }));
    mutate();
    toast.success("Artifact created successfully");
    return true;
  };

  const updateArtifact = async (
    artifact: ArtifactCreateUpdateRequest,
  ): Promise<boolean> => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifact.artifactName)}`;
    const response = await browserApiClient(url, {
      method: "PUT",
      body: JSON.stringify({
        artifactName: artifact.artifactName,
        informationSources: artifact.informationSources || [],
      }),
    });
    if (!response.ok) {
      toast.error("Failed to update artifact: " + response.statusText);
      return false;
    }

    interface UpdateArtifactResponse {
      artifact: ArtifactDTO;
      invalidURLs: ExternalReferenceErrorDTO[];
    }
    const resp = (await response.json()) as UpdateArtifactResponse;
    const updatedArtifact = resp.artifact;

    if (resp.invalidURLs && resp.invalidURLs.length > 0) {
      toast.error(
        `Some upstream URLs were invalid: ${resp.invalidURLs.map((r) => r.url + ": " + r.reason).join(", ")}`,
      );
      return false;
    }

    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: prev!.artifacts.map((a) =>
        a.artifactName === artifact.artifactName ? updatedArtifact : a,
      ),
    }));
    mutate();
    toast.success("Artifact updated");
    return true;
  };

  const { branches, tags } = useAssetBranchesAndTags();

  const handleToggleSource = (url: string) => {
    setSelectedSourceUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleToggleAllSources = (urls: string[]) => {
    setSelectedSourceUrls((prev) => {
      const next = new Set(prev);
      const allSelected = urls.every((url) => next.has(url));
      if (allSelected) {
        urls.forEach((url) => next.delete(url));
      } else {
        urls.forEach((url) => next.add(url));
      }
      return next;
    });
  };

  const handleBulkDeleteSources = async () => {
    const urlsToDelete = Array.from(selectedSourceUrls);
    if (urlsToDelete.length === 0) return;

    // Group selected URLs by artifact
    const artifactUpdates: Array<{
      artifactName: string;
      remainingSources: InformationSources[];
    }> = [];

    for (const artifact of artifacts) {
      const artifactSources = rootNodes?.[artifact.artifactName] || [];
      const remainingSources = artifactSources.filter(
        (source) => !urlsToDelete.includes(source.url),
      );

      // Only include artifacts that have sources being deleted
      if (remainingSources.length !== artifactSources.length) {
        artifactUpdates.push({
          artifactName: artifact.artifactName,
          remainingSources,
        });
      }
    }

    if (artifactUpdates.length === 0) {
      toast.info("No sources to delete");
      return;
    }

    toast.info(`Deleting ${urlsToDelete.length} SBOM source(s)...`);

    let successCount = 0;
    let errorCount = 0;

    for (const { artifactName, remainingSources } of artifactUpdates) {
      const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifactName)}`;

      try {
        const response = await browserApiClient(url, {
          method: "PUT",
          body: JSON.stringify({
            artifactName,
            informationSources: remainingSources,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
          console.error(
            `Failed to update artifact ${artifactName}:`,
            response.statusText,
          );
        }
      } catch (error) {
        errorCount++;
        console.error(`Error updating artifact ${artifactName}:`, error);
      }
    }

    if (successCount > 0) {
      toast.success(
        `Successfully removed sources from ${successCount} artifact(s)`,
      );
      mutate();
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} artifact(s)`);
    }

    setSelectedSourceUrls(new Set());
  };

  return (
    <Page Menu={assetMenu} title={"Manage Artifacts"} Title={<AssetTitle />}>
      <div className="flex flex-row">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <BranchTagSelector branches={branches} tags={tags} />
            {session && (
              <Button onClick={openCreateDialog}>Create new Artifact</Button>
            )}
          </div>
          <Section
            primaryHeadline
            description={
              <span>
                Manage and view artifacts associated with this ref (branch or
                tag). An artifact represents a build output or deliverable
                linked to your repository (e.g. source code, binaries, container
                images).{" "}
                <Link
                  className="text-primary text-sm inline-flex items-center gap-1"
                  href={documentationLinks.artifactExplaining}
                  target="_blank"
                >
                  <QuestionMarkCircleIcon className="w-3 h-3" />
                  Learn more about artifacts.
                </Link>
              </span>
            }
            title="Manage Artifacts"
            forceVertical
          >
            <div>
              {artifacts.length === 0 ? (
                <EmptyParty
                  title="No Artifacts Available"
                  description="There are currently no artifacts associated with this ref (branch or tag)."
                />
              ) : (
                <div className="overflow-hidden rounded-lg border shadow-sm">
                  <div className="overflow-auto">
                    <table className="w-full overflow-x-auto text-sm">
                      <thead className="border-b bg-card text-foreground">
                        {/* Bulk action row - shown when sources are selected and user is logged in */}
                        {session && selectedSourceUrls.size > 0 && (
                          <tr className="bg-muted/50">
                            <td colSpan={3} className="px-4 py-2">
                              <div className="flex flex-row items-center justify-between">
                                <span className="text-sm mr-2">
                                  {selectedSourceUrls.size} SBOM source
                                  {selectedSourceUrls.size !== 1
                                    ? "s"
                                    : ""}{" "}
                                  selected
                                </span>
                                <div className="flex flex-row items-center gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDeleteSources}
                                  >
                                    Delete Selected
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedSourceUrls(new Set())
                                    }
                                  >
                                    Clear Selection
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th className="p-4 text-left">Artifact Name</th>
                          <th className="p-4 text-left">SBOM Sources</th>
                          {session && <th className="w-12" />}
                        </tr>
                      </thead>
                      <tbody className="text-sm text-foreground">
                        {artifacts.map((artifact, i) => (
                          <ArtifactRow
                            key={artifact.artifactName}
                            artifact={artifact}
                            index={i}
                            rootNodes={rootNodes![artifact.artifactName] || []}
                            hasSession={!!session}
                            selectedSourceUrls={selectedSourceUrls}
                            onToggleSource={handleToggleSource}
                            onToggleAllSources={handleToggleAllSources}
                            onEdit={() => openEditDialog(artifact)}
                            onSync={() =>
                              syncExternalSources(artifact.artifactName)
                            }
                            onDelete={() => setDeleteDialogOpen(artifact)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>

      <ArtifactDialog
        form={artifactForm}
        isOpen={dialogState.isOpen}
        onOpenChange={(open) => !open && closeDialog()}
        onSubmit={handleSubmit}
        onDelete={dialogState.mode === "edit" ? handleDelete : undefined}
        isEditMode={dialogState.mode === "edit"}
      />
      <AlertDialog
        open={Boolean(deleteDialogOpen)}
        onOpenChange={(open) => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
              Are you sure you want to delete this artifact?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this ref
              will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()}>
              <span>Confirm</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default Artifacts;
