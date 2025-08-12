import { useEffect, useState } from "react";
import { AssetDTO } from "../types/api/api";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveOrg } from "./useActiveOrg";
import { browserApiClient } from "../services/devGuardApi";
import { convertRepos } from "./useRepositorySearch";
import { toast } from "sonner";
import { ExternalTicketProvider } from "../types/common";

export default function useRepositoryConnection() {
  const activeOrg = useActiveOrg();
  const activeAsset = useActiveAsset();
  const [selectedProvider, setSelectedProvider] =
    useState<ExternalTicketProvider>(
      activeAsset?.repositoryProvider || "gitlab",
    );

  const [repositories, setRepositories] = useState<
    { value: string; label: string }[] | null
  >(null);

  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);

  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoadingRepositories(true);
      const [repoResp] = await Promise.all([
        browserApiClient(
          "/organizations/" + activeOrg.slug + "/integrations/repositories",
        ),
      ]);
      if (repoResp.ok) {
        const data = await repoResp.json();
        setRepositories(convertRepos(data));
      } else {
        toast.error("Failed to fetch repositories. Please try again.");
      }
      setIsLoadingRepositories(false);
    };
    fetchRepositories();
  }, [
    activeOrg.gitLabIntegrations,
    activeOrg.githubAppInstallations,
    activeOrg.jiraIntegrations,
    activeOrg.slug,
  ]);

  return {
    setSelectedProvider,
    selectedProvider,
    isLoadingRepositories,
    repositories,
  };
}
