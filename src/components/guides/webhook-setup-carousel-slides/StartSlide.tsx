import ProviderTitleIcon from "@/components/common/ProviderTitleIcon";
import GradientText from "@/components/misc/GradientText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationDetailsDTO } from "@/types/api/api";
import {
  ExternalTicketProvider,
  ExternalTicketProviderNames,
} from "@/types/common";
import { InfoIcon } from "lucide-react";
import ProviderSetup from "./ProviderSetup";
import { useEffect } from "react";
import { externalProviderIdToIntegrationName } from "@/utils/externalProvider";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StartSlideProps {
  setSelectedProvider: (provider: ExternalTicketProvider) => void;
  api?: {
    scrollNext: () => void;
    scrollTo: (index: number) => void;
    reInit: () => void;
  };
  provider: ExternalTicketProvider;
  activeOrg: OrganizationDetailsDTO;
  isLoadingRepositories: boolean;
}

export default function StartSlide({
  setSelectedProvider,
  isLoadingRepositories,
  provider,
  activeOrg,
  api,
}: StartSlideProps) {
  useEffect(() => {
    api?.reInit();
  }, [provider, api]);

  const asset = useActiveAsset();
  const isExternalEntityProvider =
    asset?.externalEntityProviderId &&
    // Integration for openCode and GitLab are the same
    externalProviderIdToIntegrationName(asset.externalEntityProviderId) ===
      "gitlab";

  const isOpenCode = asset?.externalEntityProviderId === "opencode";

  const handleCopy = () => {
    navigator.clipboard.writeText(isOpenCode ? "devguard" : "devguard-bot");
    toast("Username copied to clipboard", {
      description: "You can now paste it in your project.",
    });
  };

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          <GradientText
            colors={["#FEFDF8", "#FDE9B5", "#FDD36F", "#FDDA83", "#FCBF29"]}
            animationSpeed={5}
            className=""
          >
            Let&apos;s get your Tickets in Sync with DevGuard
          </GradientText>
        </DialogTitle>

        <Alert variant="default" className="mt-4">
          <InfoIcon />
          <AlertTitle>About Ticket Integration</AlertTitle>
          <AlertDescription>
            You can connect your repository at GitLab, openCode or GitHub with
            DevGuard to enable ticket-based risk management. Whenever DevGuard
            detects a new risk in your code, it will automatically create a
            ticket in your issue tracker. In you issue tracker, you can then
            work on the risk and even use slash commands to apply mitigation
            strategies.
          </AlertDescription>
        </Alert>
        <hr className="my-4" />
      </DialogHeader>
      <div className="p-1">
        {isExternalEntityProvider ? (
          <div className="">
            <h3 className="font-semibold flex items-center">
              <Badge className="mr-2" variant="secondary">
                Step 1/2
              </Badge>{" "}
              Invite the DevGuard Bot to your{" "}
              {isOpenCode ? "openCode" : "GitLab"} Project
            </h3>
            <div className="mt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                To enable ticket creation in your{" "}
                {isOpenCode ? "openCode" : "GitLab"} project, you need to invite
                the DevGuard Bot user to your project. Simply by removing the
                User from your project, you can revoke the access at any time.
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Please ensure that you grant the DevGuard Bot user
                <span className="font-semibold text-primary">
                  {" Reporter "}
                </span>
                permissions in your project.
              </p>
              {/* Copy element to copy the username */}
              <Card className="flex items-center gap-4 p-4">
                <div className="">
                  <Image
                    width={40}
                    height={40}
                    alt="DevGuard Bot Icon"
                    src="/logo_icon.svg"
                    className="size-10 rounded-full bg-muted-foreground outline -outline-offset-1 outline-background/5 p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    DevGuard Bot
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {isOpenCode ? "@devguard" : "@devguard-bot"}
                  </p>
                </div>
                <div className="">
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="bg-secondary !text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Copy Username
                  </button>
                </div>
              </Card>
            </div>
            <div className="mt-10 flex flex-row gap-2 justify-end">
              <Button
                onClick={() => {
                  api?.scrollTo(3);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="">
            <h3 className="font-semibold flex items-center">
              <Badge className="mr-2" variant="secondary">
                Step 1/3
              </Badge>{" "}
              Ensure that DevGuard is connected to your issue tracker
            </h3>
            <div className="mt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                First, select your issue tracker from the dropdown menu.
              </p>
              <Select
                value={provider}
                onValueChange={(value) => {
                  setSelectedProvider(value as ExternalTicketProvider);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ExternalTicketProviderNames).map((provider) => (
                    <SelectItem
                      key={provider}
                      value={provider}
                      onClick={() =>
                        setSelectedProvider(provider as ExternalTicketProvider)
                      }
                    >
                      <ProviderTitleIcon
                        provider={provider as ExternalTicketProvider}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6">
              <ProviderSetup
                selectedProvider={provider}
                activeOrg={activeOrg}
                api={api}
                isLoadingRepositories={isLoadingRepositories}
              />
            </div>
          </div>
        )}
      </div>
    </CarouselItem>
  );
}
