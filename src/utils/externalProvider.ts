export const providerIdToBaseURL = (provider?: string) => {
  if (provider === "official") {
    return "https://gitlab.com";
  } else if (provider === "opencode") {
    return "https://gitlab.opencode.de";
  }
  return "";
};

export const externalProviderIdToIntegrationName = (
  provider?: string,
): "github" | "gitlab" => {
  if (provider === "official") {
    return "gitlab";
  } else if (provider === "opencode") {
    return "gitlab";
  } else if (provider === "github") {
    return "github";
  }
  throw new Error(
    `Unknown external provider ID: ${provider}. Expected 'official', 'opencode', or 'github'.`,
  );
};
