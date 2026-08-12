import { useActiveAsset } from "./useActiveAsset";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";

const useScopedAccessToken = () => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const activeAsset = useActiveAsset();

  if (activeOrg && activeProject && activeAsset) {
    return `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/assets/${activeAsset.slug}/pats/`;
  }
  if (activeOrg && activeProject) {
    return `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/pats/`;
  }
  if (activeOrg) {
    return `/organizations/${activeOrg.slug}/pats/`;
  }
  return `/pats/`;
};

export default useScopedAccessToken;
