import GradientText from "@/components/misc/GradientText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classNames } from "@/utils/common";
import { InfoIcon, Terminal } from "lucide-react";

interface StartSlideProps {
  setSelectedScanner: (scanner: string) => void;
  selectedScanner: string | undefined;
  api?: {
    scrollNext: () => void;
  };
}

export default function StartSlide({
  setSelectedScanner,
  selectedScanner,
  api,
}: StartSlideProps) {
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
            You can connect your repository at GitLab, openCode, GitHub or Jira
            to DevGuard to enable ticket-based risk management. Whenever
            DevGuard detects a new risk in your code, it will automatically
            create a ticket in your issue tracker. In you issue tracker, you can
            then work on the risk and even use slash commands to apply
            mitigation strategies.
          </AlertDescription>
        </Alert>
        <hr className="my-8" />
      </DialogHeader>

      <div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Card
          onClick={() => setSelectedScanner("devsecops")}
          className={classNames(
            "col-span-2 cursor-pointer",
            selectedScanner === "devsecops"
              ? "border border-primary"
              : "border border-transparent",
          )}
        >
          <CardContent className="p-0">
            <CardHeader>
              <CardTitle className="text-lg leading-tight">
                Integrate whole DevSecOps-Pipeline
              </CardTitle>
              <CardDescription>
                Integrate a whole DevSecOps-Pipeline including dependency risk
                identification. This is only possible through CI/CD Components
                and GitHub-Actions.
              </CardDescription>
            </CardHeader>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button
          disabled={selectedScanner === undefined}
          onClick={() => api?.scrollNext()}
        >
          {selectedScanner === undefined ? "Select a scanner" : "Continue"}
        </Button>
      </div>
    </CarouselItem>
  );
}
