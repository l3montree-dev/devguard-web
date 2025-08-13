// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { Config, GitInstances } from "@/types/common";
import { useEffect } from "react";
import { CarouselApi } from "../../ui/carousel";
import { YamlGeneratorSlide } from "./slides";

export const YamlGenerator = ({
  api,
  gitInstance,
  apiUrl,
  prev,
  orgSlug,
  projectSlug,
  assetSlug,
  config,
}: {
  gitInstance: GitInstances;
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api: CarouselApi;
  apiUrl: string;
  pat?: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}) => {
  const activeOrg = useActiveOrg();

  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  useEffect(() => {
    api?.reInit(); //this is redundant rn, will change
  }, [api, config]);

  return (
    <>
      <YamlGeneratorSlide
        gitInstance={gitInstance}
        config={config}
        orgSlug={orgSlug}
        projectSlug={projectSlug}
        assetSlug={assetSlug}
        apiUrl={apiUrl}
        activeOrg={activeOrg}
        activeProject={activeProject}
        asset={asset || null}
        prev={prev}
      />
    </>
  );
};

export default YamlGenerator;
