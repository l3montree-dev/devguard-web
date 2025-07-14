import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import { GitLabIntegrationDialog } from "@/components/common/GitLabIntegrationDialog";
import ListItem from "@/components/common/ListItem";
import ProviderTitleIcon from "@/components/common/ProviderTitleIcon";
import GradientText from "@/components/misc/GradientText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";
import { OrganizationDetailsDTO } from "@/types/api/api";
import { ExternalTicketProvider } from "@/types/common";
import { providerNameToExternalTicketProvider } from "@/utils/common";
import { values } from "lodash";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import ProviderSetup from "./ProviderSetup";

interface StartSlideProps {
  setSelectedProvider: (scanner: string) => void;
  selectedProvider: string | undefined;
  api?: {
    scrollNext: () => void;
  };
  provider?: ExternalTicketProvider;
  activeOrg: OrganizationDetailsDTO;
}

export default function StartSlide({
  setSelectedProvider,
  selectedProvider,
  provider,
  activeOrg,
  api,
}: StartSlideProps) {
  const router = useRouter();

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
          <Select
            value={providerNameToExternalTicketProvider(selectedProvider || "")}
            onValueChange={(value) => {
              setSelectedProvider(value);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Provider" />
            </SelectTrigger>
            <SelectContent>
              {values(ExternalTicketProvider).map((provider) => (
                <SelectItem
                  key={provider}
                  value={provider}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <ProviderTitleIcon provider={provider} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mt-4 flex items-center">
            <Badge className="mr-2" variant="secondary">
              Step 1/2
            </Badge>{" "}
            Ensure that DevGuard can create tickets in your issue tracker
          </h3>
          <ProviderSetup
            selectedProvider={providerNameToExternalTicketProvider(
              selectedProvider || "",
            )}
            activeOrg={activeOrg}
            api={api}
          />
        </div>
      </div>
    </CarouselItem>
  );
}
