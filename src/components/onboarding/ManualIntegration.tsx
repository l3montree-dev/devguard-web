// Copyright 2025 larshermges
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Image from "next/image";

import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { AsyncButton, Button } from "../ui/button";
import { classNames } from "@/utils/common";

import { useCallback, useEffect, useRef, useState } from "react";
import CopyCode from "../common/CopyCode";
import { Separator } from "../ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import FileUpload from "../FileUpload";
import { multipartBrowserApiClient } from "@/services/devGuardApi";
import router from "next/router";
import { toast } from "sonner";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useDropzone } from "react-dropzone";
import { Hexagon } from "lucide-react";
import { config } from "@/config";
import { Tab } from "@headlessui/react";
import CustomTab from "../common/CustomTab";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type Command = "container-scanning" | "sbom" | "sarif";

export type cicdIntegration = "GitHub" | "Gitlab";

export const ManualIntegration = ({
  api,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  api: CarouselApi;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  const generateDockerSnippet = (
    command: string,
    orgSlug: string,
    projectSlug: string,
    assetSlug: string,
    apiUrl: string,
    token?: string,
  ) => {
    let path = "/app";
    if (command === "container-scanning") {
      path = "/app/image.tar";
    }

    if (command === "sbom") {
      path = "/app/<SBOM.json>";
    }

    if (command === "sarif") {
      path = "/app/results.sarif";
    }

    if (apiUrl === "http://localhost:8080") {
      apiUrl = "http://host.docker.internal:8080";
    }
    return `docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner:${config.devguardScannerTag} \\
devguard-scanner ${command} \\
    --path="${path}" \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}"`;
  };

  const [cicdIntegration, setCicdIntegration] = useState<cicdIntegration>();
  const [fileName, setFileName] = useState<string>();
  const fileContent = useRef<any>(undefined);
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const uploadSBOM = async () => {
    const formdata = new FormData();
    formdata.append("file", fileContent.current);
    const resp = await multipartBrowserApiClient(
      `/organizations/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}/sbom-file`,

      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "SBOM-File-Upload" },
      },
    );
    if (resp.ok) {
      toast.success("SBOM has successfully been send!");
    } else {
      toast.error("SBOM has not been send successfully");
    }

    router.push(
      `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/dependency-risks`,
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        try {
          const readerContent = reader.result as string;
          let sbomParsed;
          sbomParsed = JSON.parse(readerContent);
          if (sbomParsed.bomFormat === "CycloneDX") {
            fileContent.current = file;
            setFileName(file.name);
          } else
            toast.error(
              "SBOM does not follow CycloneDX format or Version is <1.6",
            );
        } catch (e) {
          toast.error(
            "JSON format is not recognized, make sure it is the proper format",
          );
          return;
        }
      };

      reader.readAsText(file);
    });
  }, []);

  const codeStringBuilder = (
    command: Command,
    orgSlug: string,
    projectSlug: string,
    assetSlug: string,
    apiUrl: string,
  ) => {
    const codeString = generateDockerSnippet(
      command,
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    );

    return codeString;
  };

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  useEffect(() => {
    api?.reInit(); //this is redundant rn, will change
  }, [api, cicdIntegration]);

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>What should your Scanner be able to do?</DialogTitle>
          <DialogDescription>Select exactly what you want</DialogDescription>
        </DialogHeader>
        <div className="mt-4 sm:mx-auto mt-8">
          <Tabs>
            <TabsList>
              <TabsTrigger value="sbom">SBOM </TabsTrigger>
              <TabsTrigger value="sarif">SARIF</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-lg"></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <FileUpload
                files={fileName ? [fileName] : []}
                dropzone={dropzone}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="m-4 w-full flex flex-row items-center gap-4">
            <Separator className="flex-1" orientation="horizontal" />
            <span className="text-sm text-muted-foreground">
              Or add to CI/CD
            </span>
            <Separator className="flex-1" orientation="horizontal" />
          </div>
          {/* <div className="flex w-full mb-4">
            <Button
              variant={"ghost"}
              className={classNames(
                "w-full",
                cicdIntegration === "GitHub"
                  ? "border border-primary"
                  : "border border-transparent",
              )}
              onClick={() => setCicdIntegration("GitHub")}
            >
              <Image
                src="/assets/github.svg"
                alt="GitHub Logo"
                className="mr-2 dark:invert"
                width={24}
                height={24}
              />
              GitHub
            </Button>
            <Button
              variant={"ghost"}
              className={classNames(
                "w-full",
                cicdIntegration === "Gitlab"
                  ? "border border-primary"
                  : "border border-transparent",
              )}
              onClick={() => {
                setCicdIntegration("Gitlab");
              }}
            >
              <Image
                src="/assets/gitlab.svg"
                alt="GitHub Logo"
                className="mr-2"
                width={24}
                height={24}
              />
              GitLab
            </Button>
          </div> */}
          {/* {cicdIntegration === "Gitlab" && ( */}
          <>
            <CopyCode
              language="shell"
              codeString={codeStringBuilder(
                "sbom",
                orgSlug,
                projectSlug,
                assetSlug,
                apiUrl,
              )}
            />
          </>
          {/* )} */}
          <div className="flex mt-4 flex-row gap-2 justify-end">
            <Button variant={"secondary"} onClick={() => api?.scrollPrev()}>
              Back
            </Button>
            <AsyncButton disabled={!fileName} onClick={uploadSBOM}>
              {fileName ? "Finish" : "Continue"}
            </AsyncButton>
          </div>
        </div>
      </CarouselItem>
    </>
  );
};
export default ManualIntegration;
