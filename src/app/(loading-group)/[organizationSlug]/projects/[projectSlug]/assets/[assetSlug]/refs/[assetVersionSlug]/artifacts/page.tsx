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

const Artifacts = () => {
  const assetMenu = useAssetMenu();

  const artifacts = useArtifacts();
  const updateAssetVersionState = useUpdateAssetVersionState();

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
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

  return (
    <Page Menu={assetMenu} title={"Artifacts"} Title={<AssetTitle />}>
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="Manage and view artifacts associated with this asset version."
            title="Artifacts"
            forceVertical
          >
            {artifacts.length === 0 && (
              <EmptyParty
                title="No Artifacts Available"
                description="There are currently no artifacts associated with this asset version."
              />
            )}
            {artifacts.map((artifact) => (
              <ListItem
                key={artifact.artifactName + artifact.assetVersionName}
                Title={artifact.artifactName}
                Button={
                  <Alert
                    onConfirm={() => deleteArtifact(artifact)}
                    title="Delete Artifact"
                    description={`Are you sure you want to delete the artifact "${artifact.artifactName}"? This action cannot be undone.`}
                  >
                    <Button variant="destructive">Delete</Button>
                  </Alert>
                }
              />
            ))}
          </Section>
        </div>
      </div>
    </Page>
  );
};

export default Artifacts;
