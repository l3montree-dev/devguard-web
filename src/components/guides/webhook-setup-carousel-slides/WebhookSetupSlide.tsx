import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import { useStore } from "@/zustand/globalStoreProvider";
import { useState } from "react";
import { config } from "@/config";
import { InputWithCustomButton } from "@/components/ui/input-with-custom-button";
import { ImageZoom } from "@/components/common/Zoom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { externalProviderIdToIntegrationName } from "@/utils/externalProvider";
import { DialogDescription } from "@radix-ui/react-dialog";

interface WebhookSetupSlideProps {
  api?: {
    scrollPrev: () => void;
    scrollTo: (index: number) => void;
  };
  onOpenChange: (open: boolean) => void;
}

export default function WebhookSetupSlide({
  api,
  onOpenChange,
}: WebhookSetupSlideProps) {
  const generateNewSecret = (): string => {
    return crypto.randomUUID();
  };
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const updateAsset = useStore((s) => s.updateAsset);
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  const isExternalEntityProvider =
    asset?.externalEntityProviderId &&
    // Integration for openCode and GitLab are the same
    externalProviderIdToIntegrationName(asset.externalEntityProviderId) ===
      "gitlab";

  const isOpenCode = asset?.externalEntityProviderId === "opencode";

  const handleCopy = () => {
    navigator.clipboard.writeText("devguard");
    toast("Username copied to clipboard", {
      description: "You can now paste it in your project.",
    });
  };

  const handleGenerateNewSecret = async () => {
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${project!.slug}/assets/${asset.slug}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ["webhookSecret"]: generateNewSecret(),
        }),
      },
    );

    if (resp.ok) {
      const r = await resp.json();
      setWebhookSecret(r.webhookSecret);
      asset.webhookSecret = r.webhookSecret;
      updateAsset(asset);
      navigator.clipboard.writeText(r.webhookSecret);
      toast.success("New webhook secret generated and copied to clipboard");
    } else {
      toast.error("Could not generate new secret");
    }
  };
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Set Webhook to allow DevGuard to recieve ticket updates
        </DialogTitle>
      </DialogHeader>
      <p className="mb-4 mt-4 text-sm">
        Go to your GitLab/ openCode project settings and add a webhook with the
        following URL and secret (“Settings” → “Webhooks”). Ensure that you
        select the Issue and comment event trigger checkboxes like shown in the
        screenshot below. You must set a secret token.
      </p>

      <Image
        src="/assets/gitlab-webhooks-combined.png"
        alt="GitLab Webhooks"
        className="rounded-md w-full h-auto"
        width={1280}
        height={720}
      />

      <div className="p-1">
        <InputWithCustomButton
          label="Webhook URL"
          value={config.devguardApiUrlPublicInternet + "/api/v1/webhook/"}
          onClick={() => {
            navigator.clipboard.writeText(
              config.devguardApiUrlPublicInternet + "/api/v1/webhook/",
            );
            toast.success("Webhook URL copied to clipboard");
          }}
          buttonChildren={"Copy"}
        />
        <div className="mt-4">
          <InputWithCustomButton
            buttonVariant={!!webhookSecret ? "secondary" : "default"}
            label="Webhook Secret"
            value={webhookSecret ?? "No webhook secret set"}
            onClick={() => {
              handleGenerateNewSecret();
            }}
            buttonChildren={"Create & Copy"}
          />
        </div>
      </div>
      <div className="flex mt-10 flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          onClick={() =>
            isExternalEntityProvider ? api?.scrollTo(0) : api?.scrollPrev()
          }
        >
          Back
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          disabled={
            webhookSecret !== null && webhookSecret.length > 0 ? false : true
          }
        >
          Finish!
        </Button>
      </div>
    </CarouselItem>
  );
}
