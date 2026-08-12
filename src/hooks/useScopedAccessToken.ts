import { useActiveAsset } from "./useActiveAsset";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";

const useScopedAccessToken = () => {
  const org = useActiveOrg();
  const activeProject = useActiveProject();
  const activeAsset = useActiveAsset();

  const activeOrg = org?.id && org.slug !== "/" ? org : undefined;

  if (activeOrg?.slug && activeProject?.slug && activeAsset?.slug) {
    return `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/assets/${activeAsset.slug}/pats/`;
  }
  if (activeOrg?.slug && activeProject?.slug) {
    return `/organizations/${activeOrg.slug}/projects/${activeProject.slug}/pats/`;
  }
  if (activeOrg?.slug) {
    return `/organizations/${activeOrg.slug}/pats/`;
  }
  return `/pats/`;
};

export default useScopedAccessToken;
