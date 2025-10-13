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
import { useState } from "react";
import ArtifactForm from "@/components/common/ArtifactForm";
import { useForm } from "react-hook-form";

const Artifacts = () => {
  const assetMenu = useAssetMenu();

  const artifacts = useArtifacts();
  const updateAssetVersionState = useUpdateAssetVersionState();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<ArtifactDTO | null>(
    null,
  );

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

  const openEditDialog = (artifact: ArtifactDTO) => {
    setEditingArtifact(artifact);
    artifactForm.reset({
      artifactName: artifact.artifactName,
      assetId: artifact.assetId,
      assetVersionName: artifact.assetVersionName,
      upstreamUrls: artifact.upstreamUrls || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: ArtifactDTO) => {
    if (!editingArtifact) return;

    await updateArtifact({
      ...editingArtifact,
      artifactName: data.artifactName,
      upstreamUrls: data.upstreamUrls,
    });

    setIsEditDialogOpen(false);
    setEditingArtifact(null);
    artifactForm.reset();
  };

  const handleDelete = async () => {
    if (!editingArtifact) return;

    await deleteArtifact(editingArtifact);

    setIsEditDialogOpen(false);
    setEditingArtifact(null);
    artifactForm.reset();
  };

  const createArtifact = async (data: ArtifactDTO) => {
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
      return;
    }

    const newArtifact = await resp.json();
    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: [...prev!.artifacts, newArtifact],
    }));

    toast.success("Artifact created successfully");
    setIsCreateDialogOpen(false);
    artifactForm.reset();
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

  const updateArtifact = async (artifact: ArtifactDTO) => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifact.artifactName)}`;
    const resp = await browserApiClient(url, {
      method: "PUT",
      body: JSON.stringify({
        artifactName: artifact.artifactName,
        upstreamUrls: artifact.upstreamUrls || [],
      }),
    });
    if (!resp.ok) {
      toast.error("Failed to update artifact: " + resp.statusText);
      return;
    }
    const updatedArtifact = await resp.json();
    updateAssetVersionState((prev) => ({
      ...prev!,
      artifacts: prev!.artifacts.map((a) =>
        a.artifactName === artifact.artifactName ? updatedArtifact : a,
      ),
    }));

    toast.success("Artifact updated");
  };

  return (
    <Page Menu={assetMenu} title={"Artifacts"} Title={<AssetTitle />}>
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="Manage and view artifacts associated with this asset version."
            title="Artifacts"
            forceVertical
            /*             Button={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create new Artifact
              </Button>
            } */
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

      {/*       <ArtifactForm
        form={artifactForm}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={createArtifact}
      /> */}

      <ArtifactForm
        form={artifactForm}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
        onDelete={handleDelete}
        isEditMode={true}
      />
    </Page>
  );
};

export default Artifacts;
