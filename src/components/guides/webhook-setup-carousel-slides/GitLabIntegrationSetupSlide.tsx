import GitLabIntegrationForm from "@/components/common/GitLabIntegrationForm";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { GitLabIntegrationDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";

export interface GitLabIntegrationSetupSlideProps {
  api?: {
    scrollNext: () => void;
  };
}

export default function GitLabIntegrationSetupSlide({
  api,
}: GitLabIntegrationSetupSlideProps) {
  const activeOrg = useActiveOrg();
  const updateOrganization = useStore((s) => s.updateOrganization);

  const handleNewGitLabIntegration = (integration: GitLabIntegrationDTO) => {
    updateOrganization({
      ...activeOrg,
      gitLabIntegrations: activeOrg.gitLabIntegrations.concat(integration),
    });
  };

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Connect with GitLab to allow DevGuard to create tickets
        </DialogTitle>
        <hr className="my-4" />
      </DialogHeader>
      <div className="p-1">
        <GitLabIntegrationForm
          onNewIntegration={handleNewGitLabIntegration}
          additionalOnClick={api?.scrollNext}
        />
      </div>
    </CarouselItem>
  );
}
