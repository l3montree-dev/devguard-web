import { useConfig } from "@/context/ConfigContext";

export const providerIdToBaseURL = (provider?: string) => {
  const config = useConfig();
  const oauthConfig = config.gitlabOAuth2Config?.find(
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
  if (provider === "gitlab") {
    return "gitlab";
  } else if (provider === "opencode") {
    return "gitlab";
  } else if (provider === "github") {
    return "github";
  }
  return undefined;
};
