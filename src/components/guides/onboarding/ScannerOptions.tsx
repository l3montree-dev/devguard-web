// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveAsset } from "@/hooks/useActiveAsset";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { useEffect, useState } from "react";
import { AssetDTO } from "../../../types/api/api";
import { GithubTokenSlides } from "../../risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "../../risk-identification/GitlabTokenInstructions";
import { CarouselApi } from "../../ui/carousel";
import { ScannerOptionsSelectionSlide } from "./slides";

interface Config {
  "secret-scanning": boolean;
  sca: boolean;
  "container-scanning": boolean;
  sast: boolean;
  iac: boolean;
  build: boolean;
}

export const ScannerOptions = ({
  api,
  apiUrl,
  setup,
  next,
  prev,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api?: CarouselApi;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  const pat = usePersonalAccessToken();

  const asset = useActiveAsset();

  const [config, setConfig] = useState<Config>({
    "secret-scanning": true,
    sca: true,
    "container-scanning": true,
    sast: true,
    iac: true,
    build: true,
  });

  const [gitInstance, setGitInstance] =
    useState<AssetDTO["repositoryProvider"]>("gitlab");

  useEffect(() => {
    api?.reInit();
  }, [api, config, gitInstance]);

  console.log(config);

  return (
    <>
      <ScannerOptionsSelectionSlide
        config={config}
        setConfig={setConfig}
        next={next}
        prev={prev}
      />
      {asset?.repositoryProvider === "github" && (
        <GithubTokenSlides
          api={api}
          apiUrl={apiUrl}
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          assetSlug={assetSlug}
          pat={pat.pat?.privKey}
          prev={api?.scrollPrev}
          next={api?.scrollNext}
          config={config}
        />
      )}
      {asset?.repositoryProvider === "gitlab" && (
        <GitlabTokenSlides
          api={api}
          apiUrl={apiUrl}
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          assetSlug={assetSlug}
          pat={pat.pat?.privKey}
          prev={api?.scrollPrev}
          next={api?.scrollNext}
          config={config}
        />
      )}
    </>
  );
};
export default ScannerOptions;
