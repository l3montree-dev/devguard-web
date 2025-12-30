import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FunctionComponent, useState } from "react";
import { useConfig } from "../../../context/ConfigContext";
import { useActiveAsset } from "../../../hooks/useActiveAsset";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useActiveProject } from "../../../hooks/useActiveProject";
import usePersonalAccessToken from "../../../hooks/usePersonalAccessToken";
import { generateDockerSnippet } from "../../../integrationSnippets";
import CopyCode from "../../common/CopyCode";
import Section from "../../common/Section";
import PatSection from "../../PatSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface DevGuardCliSlideProps {
  api?: {
    scrollTo: (index: number) => void;
    reInit: () => void;
  };

  onClose: () => void;
  prevIndex: number;
}

export const DevGuardCliSlide: FunctionComponent<DevGuardCliSlideProps> = ({
  api,
  prevIndex,
  onClose,
}) => {
  const pat = usePersonalAccessToken();
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const config = useConfig();

  const [tab, setTab] = useState<"sca" | "sast">("sca");
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>Install the DevGuard CLI to scan your project</DialogTitle>
        <DialogDescription>
          To scan your project locally, you can use the DevGuard CLI. Follow the
          instructions below to install the CLI tool.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col px-1 mt-4 text-sm text-muted-foreground gap-4">
        <Section
          className="mb-4"
          forceVertical
          title="Install DevGuard CLI using Docker or Podman"
        >
          <>
            <p>
              You can also use the DevGuard CLI via Docker by pulling the
              official image from GitHub Container Registry.
            </p>
            <CopyCode
              language="shell"
              codeString="docker pull ghcr.io/l3montree-dev/devguard/devguard-scanner:latest"
            />
          </>
        </Section>
        <PatSection description="Local DevGuard CLI" {...pat} />
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "sca" | "sast")}
          defaultValue="sca"
          className="w-full"
        >
          <div className="flex">
            <TabsList>
              <TabsTrigger value="sca">Dependency vulnerabilities</TabsTrigger>
              <TabsTrigger value="sast">
                Source Code vulnerabilities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sca" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">
                  Scan for known vulnerabilities
                </CardTitle>
                <CardDescription>
                  Perform a software composition analysis (SCA) to identify
                  known vulnerabilities in your project&apos;s dependencies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CopyCode
                  language="shell"
                  codeString={`# Using docker
${generateDockerSnippet("sca", org.slug, project.slug, asset.slug, config.devguardApiUrlPublicInternet, config.frontendUrl, pat.pat?.privKey)}
`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sast" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">
                  Scan for security issues in your source code
                </CardTitle>
                <CardDescription>
                  Perform a static application security testing (SAST) to
                  identify security issues in your project&apos;s source code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CopyCode
                  language="shell"
                  codeString={`# Using docker
${generateDockerSnippet("sast", org.slug, project.slug, asset.slug, config.devguardApiUrlPublicInternet, config.frontendUrl, pat.pat?.privKey)}
`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-0 flex flex-wrap flex-row gap-2 justify-end">
          <Button
            variant={"secondary"}
            id="install-devguard-cli-back"
            onClick={() => {
              api?.scrollTo(prevIndex);
            }}
          >
            Back
          </Button>
          <Button id="install-devguard-cli-finish" onClick={onClose}>
            Finish
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};
