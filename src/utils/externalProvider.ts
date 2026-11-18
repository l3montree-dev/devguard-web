// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { GitlabOAuth2Config } from "@/types/dto";

export const providerIdToBaseURL = (
  provider?: string,
  gitlabOAuth2Config?: GitlabOAuth2Config[],
) => {
  const oauthConfig = gitlabOAuth2Config?.find(
    (oauthConf) => provider === oauthConf.providerID,
  );
  if (oauthConfig) {
    return oauthConfig.gitlabBaseURL;
  }
  if (provider === "gitlab") {
    return "https://gitlab.com";
  } else if (provider === "opencode") {
    return "https://gitlab.opencode.de";
  }
  return "";
};

export const externalProviderIdToIntegrationName = (
  provider?: string,
): "github" | "gitlab" | undefined => {
  if (!provider) {
    return undefined;
  }
  // every non-github provider (gitlab, opencode, custom kratos provider IDs) is a gitlab instance
  return provider === "github" ? "github" : "gitlab";
};
