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

interface StartSlideProps {
  setSelectedProvider: (provider: ExternalTicketProvider) => void;
  api?: {
    scrollNext: () => void;
    scrollTo: (index: number) => void;
    reInit: () => void;
  };
  provider: ExternalTicketProvider;
  activeOrg: OrganizationDetailsDTO;
}

export default function StartSlide({
  setSelectedProvider,

  provider,
  activeOrg,
  api,
}: StartSlideProps) {
  useEffect(() => {
    api?.reInit();
  }, [provider, api]);

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
            />
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
