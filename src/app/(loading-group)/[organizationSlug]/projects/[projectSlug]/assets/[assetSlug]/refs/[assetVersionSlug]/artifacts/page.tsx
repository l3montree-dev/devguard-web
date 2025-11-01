// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import ArtifactForm from "@/components/common/ArtifactForm";
import AssetTitle from "@/components/common/AssetTitle";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import { ArtifactCreateUpdateRequest, ArtifactDTO } from "@/types/api/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BranchTagSelector } from "../../../../../../../../../../components/BranchTagSelector";
import {
  useArtifacts,
  useUpdateAssetVersionState,
} from "../../../../../../../../../../context/AssetVersionContext";
import { useAssetBranchesAndTags } from "../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import { classNames } from "../../../../../../../../../../utils/common";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../../../../../components/ui/dropdown-menu";
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
import { TriangleAlert } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import { Badge } from "../../../../../../../../../../components/ui/badge";
import ArtifactDialog from "../../../../../../../../../../components/common/ArtifactDialog";

const Artifacts = () => {
  const assetMenu = useAssetMenu();

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

  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug: string;
  };

  const {
    data: rootNodes,
    isLoading,
    mutate,
  } = useSWR<{
    [artifactName: string]: string[];
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

  const [invalidUrls, setInvalidUrls] = useState<string[]>([]);

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
          ? rootNodes[artifact.artifactName].map((url) => ({ url }))
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
        informationSources: data.informationSources.map((el) => el.url) || [],
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
        informationSources:
          artifact.informationSources.map((el) => el.url) || [],
      }),
    });
    if (!response.ok) {
      toast.error("Failed to update artifact: " + response.statusText);
      return false;
    }

    interface UpdateArtifactResponse {
      artifact: ArtifactDTO;
      invalidURLs: string[];
    }
    const resp = (await response.json()) as UpdateArtifactResponse;
    const updatedArtifact = resp.artifact;

    if (resp.invalidURLs && resp.invalidURLs.length > 0) {
      setInvalidUrls(resp.invalidURLs);
      toast.error(
        `Some upstream URLs were invalid: ${resp.invalidURLs.join(", ")}`,
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
    setInvalidUrls([]);
    return true;
  };

  useEffect(() => {
    // Reset invalid URLs whenever the dialog is opened
    if (dialogState.isOpen) {
      setInvalidUrls([]);
    }
  }, [dialogState.isOpen]);

  const { branches, tags } = useAssetBranchesAndTags();

  return (
    <Page Menu={assetMenu} title={"Artifacts"} Title={<AssetTitle />}>
      <div className="flex flex-row">
        <div className="flex-1">
          <BranchTagSelector branches={branches} tags={tags} />
          <Section
            primaryHeadline
            description="Manage and view artifacts associated with this asset version."
            title="Artifacts"
            forceVertical
            Button={
              <Button onClick={openCreateDialog}>Create new Artifact</Button>
            }
          >
            <div>
              {artifacts.length === 0 ? (
                <EmptyParty
                  title="No Artifacts Available"
                  description="There are currently no artifacts associated with this asset version."
                />
              ) : (
                <div>
                  <div className="overflow-hidden rounded-lg border shadow-sm">
                    <div className="overflow-auto">
                      <table className="w-full table-fixed overflow-x-auto text-sm">
                        <thead className="border-b bg-card text-foreground">
                          <tr>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">
                              Information sources
                            </th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {artifacts.map((artifact, i) => (
                            <tr
                              key={artifact.artifactName}
                              className={classNames(
                                "border-b",
                                i % 2 !== 0 && "bg-card/50",
                              )}
                            >
                              <td className="content-start p-4 text-left font-medium">
                                {artifact.artifactName}
                              </td>
                              <td className="px-4 py-2">
                                {artifact.artifactName in rootNodes! &&
                                rootNodes![artifact.artifactName].length > 0 ? (
                                  <div className="flex flex-row flex-wrap gap-2">
                                    {rootNodes![artifact.artifactName].map(
                                      (node) =>
                                        node.startsWith("vex:") ? (
                                          <Badge variant={"success"} key={node}>
                                            {node.replaceAll("vex:", "")}
                                          </Badge>
                                        ) : node.startsWith("sbom:") ? (
                                          <Badge variant={"blue"} key={node}>
                                            {node.replaceAll("sbom:", "")}
                                          </Badge>
                                        ) : (
                                          <Badge variant={"outline"} key={node}>
                                            {node}
                                          </Badge>
                                        ),
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    No upstream URLs
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 content-start text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="artifact-options"
                                    asChild
                                  >
                                    <Button variant="ghost" size={"icon"}>
                                      <EllipsisHorizontalIcon className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(artifact)}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        syncExternalSources(
                                          artifact.artifactName,
                                        )
                                      }
                                    >
                                      Sync External Sources
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setDeleteDialogOpen(artifact)
                                      }
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
        invalidUrls={invalidUrls}
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
