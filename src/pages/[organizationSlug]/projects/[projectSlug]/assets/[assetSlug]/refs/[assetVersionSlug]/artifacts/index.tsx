// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Alert from "@/components/common/Alert";
import AssetTitle from "@/components/common/AssetTitle";
import EmptyParty from "@/components/common/EmptyParty";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { middleware } from "@/decorators/middleware";
import { withArtifacts } from "@/decorators/withArtifacts";
import { withAsset } from "@/decorators/withAsset";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import { ArtifactDTO } from "@/types/api/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

const Artifacts = () => {
  const assetMenu = useAssetMenu();

  const router = useRouter();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    router.query;

  const artifacts = useArtifacts();

  const [artifactsState, setArtifactsState] =
    useState<ArtifactDTO[]>(artifacts);

  const deleteArtifact = async (artifact: ArtifactDTO) => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(artifact.artifactName)}/`;
    const resp = await browserApiClient(url, { method: "DELETE" });
    if (!resp.ok) {
      toast.error("Failed to delete artifact: " + resp.statusText);
      return;
    }
    setArtifactsState((current) =>
      current.filter((a) => a.artifactName !== artifact.artifactName),
    );
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
            {artifactsState.length === 0 && (
              <EmptyParty
                title="No Artifacts Available"
                description="There are currently no artifacts associated with this asset version."
              />
            )}
            {artifactsState.map((artifact) => (
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

export const getServerSideProps = middleware(
  async () => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    project: withProject,
    contentTree: withContentTree,
    organization: withOrganization,
    asset: withAsset,
    assetVersion: withAssetVersion,
    artifacts: withArtifacts,
  },
);
