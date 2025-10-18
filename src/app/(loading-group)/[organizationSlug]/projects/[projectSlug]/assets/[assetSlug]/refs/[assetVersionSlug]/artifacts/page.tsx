// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import Alert from "@/components/common/Alert";
import AssetTitle from "@/components/common/AssetTitle";
import EmptyParty from "@/components/common/EmptyParty";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import { ArtifactDTO } from "@/types/api/api";
import { toast } from "sonner";
import {
  useArtifacts,
  useUpdateAssetVersionState,
} from "../../../../../../../../../../context/AssetVersionContext";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import CollapseList from "@/components/common/CollapseList";
import { useState, useEffect } from "react";
import ArtifactForm from "@/components/common/ArtifactForm";
import { useForm } from "react-hook-form";

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

  const [invalidUrls, setInvalidUrls] = useState<string[]>([]);

  const artifactForm = useForm<ArtifactDTO>({
    defaultValues: {
      artifactName: "",
      assetId: "",
      assetVersionName: "",
      upstreamUrls: [],
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
      assetId: "",
      assetVersionName: "",
      upstreamUrls: [],
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
      assetId: artifact.assetId,
      assetVersionName: artifact.assetVersionName,
      upstreamUrls: artifact.upstreamUrls || [],
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

  const handleSubmit = async (data: ArtifactDTO) => {
    let success = false;
    
    if (dialogState.mode === "create") {
      success = await createArtifact(data);
    } else if (dialogState.mode === "edit" && dialogState.artifact) {
      success = await updateArtifact({
        ...dialogState.artifact,
        artifactName: data.artifactName,
        upstreamUrls: data.upstreamUrls,
      });
    }

    if (success) {
      closeDialog();
    }
  };

  const handleDelete = async () => {
    if (dialogState.artifact) {
      await deleteArtifact(dialogState.artifact);
      closeDialog();
    }
  };

  const createArtifact = async (data: ArtifactDTO): Promise<boolean> => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/`;
    const resp = await browserApiClient(url, {
      method: "POST",
      body: JSON.stringify({
        artifactName: data.artifactName,
        upstreamUrls: data.upstreamUrls || [],
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

    toast.success("Artifact created successfully");
    return true;
  };

  const deleteArtifact = async (artifact: ArtifactDTO) => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifact.artifactName)}/`;
    const resp = await browserApiClient(url, { method: "DELETE" });
    if (!resp.ok) {
      toast.error("Failed to delete artifact: " + resp.statusText);
      return;
    }
    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: prev!.artifacts.filter(
        (a) => a.artifactName != artifact.artifactName,
      ),
    }));

    toast.success("Artifact deleted");
  };

  const updateArtifact = async (artifact: ArtifactDTO): Promise<boolean> => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifact.artifactName)}`;
    const response = await browserApiClient(url, {
      method: "PUT",
      body: JSON.stringify({
        artifactName: artifact.artifactName,
        upstreamUrls: artifact.upstreamUrls || [],
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
    const resp = await response.json() as UpdateArtifactResponse;
    const updatedArtifact = resp.artifact;


    if (resp.invalidURLs && resp.invalidURLs.length > 0) {
      setInvalidUrls(resp.invalidURLs); 
      toast.error(
        `Some upstream URLs were invalid: ${resp.invalidURLs.join(", ")}`
      );
      return false; 
    }

    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: prev!.artifacts.map((a) =>
        a.artifactName === artifact.artifactName ? updatedArtifact : a
      ),
    }));

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

  return (
    <Page Menu={assetMenu} title={"Artifacts"} Title={<AssetTitle />}>
      <div className="flex flex-row">
        <div className="flex-1">
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
              {artifacts.length === 0 && (
                <EmptyParty
                  title="No Artifacts Available"
                  description="There are currently no artifacts associated with this asset version."
                />
              )}
              {artifacts.map((artifact) => (
                <CollapseList
                  key={artifact.artifactName + artifact.assetVersionName}
                  Title={artifact.artifactName}
                  Items={artifact.upstreamUrls?.map((upstreamUrl, index) => ({
                    Title: upstreamUrl.upstreamUrl,
                    className: index % 2 === 0 ? "bg-card" : "bg-card/50",
                  }))}
                  Button={
                    <Button
                      variant="secondary"
                      onClick={() => openEditDialog(artifact)}
                    >
                      Edit
                    </Button>
                  }
                  className="mb-4"
                ></CollapseList>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <ArtifactForm
        form={artifactForm}
        isOpen={dialogState.isOpen}
        onOpenChange={(open) => !open && closeDialog()}
        onSubmit={handleSubmit}
        onDelete={dialogState.mode === "edit" ? handleDelete : undefined}
        isEditMode={dialogState.mode === "edit"}
        invalidUrls={invalidUrls} 
      />
    </Page>
  );
};

export default Artifacts;
