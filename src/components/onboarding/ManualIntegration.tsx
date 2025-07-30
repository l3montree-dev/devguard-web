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
import { GitInstances } from "@/types/common";
import { useCallback, useRef, useState } from "react";
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
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ManualUploadOptions = ({
  api,
  apiUrl,
  onOpenChange,
}: {
  api: CarouselApi;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}) => {
  const [gitInstance, setGitInstance] = useState<GitInstances>("Gitlab");
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

    onOpenChange(false);
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

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>What should your Scanner be able to do?</DialogTitle>
          <DialogDescription>Select exactly what you want</DialogDescription>
        </DialogHeader>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Upload a SBOM / SARIF</CardTitle>
            <CardDescription>Upload your SBOM / SARIF manually</CardDescription>
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
          <div className="m-4">
            <Separator className="mt-4" orientation="horizontal" />
          </div>
          <div className="flex w-full mb-4">
            <Button
              variant={"ghost"}
              className={classNames(
                "w-full",
                gitInstance === "GitHub"
                  ? "border border-primary"
                  : "border border-transparent",
              )}
              onClick={() => setGitInstance("GitHub")}
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
                gitInstance === "Gitlab"
                  ? "border border-primary"
                  : "border border-transparent",
              )}
              onClick={() => {
                setGitInstance("Gitlab");
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
            <Button
              variant={"ghost"}
              className={classNames(
                "w-full",
                gitInstance === "Other"
                  ? "border border-primary"
                  : "border border-transparent",
              )}
              onClick={() => setGitInstance("Other")}
            >
              <Hexagon className="mr-2" width={24} height={24}></Hexagon>
              Other
            </Button>
          </div>
          <DropdownMenu></DropdownMenu>
          <CopyCode
            language="shell"
            codeString={
              "devguard-scanner sbom package-lock.json --apiUrl={insert api Url} --token={insert token}\n\n\n\n"
            }
          ></CopyCode>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
export default ManualUploadOptions;
