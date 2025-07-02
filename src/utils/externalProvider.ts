export const providerIdToBaseURL = (provider?: string) => {
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
