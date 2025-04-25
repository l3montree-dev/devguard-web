import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";

import CopyCode from "../common/CopyCode";
import CustomTab from "../common/CustomTab";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Steps from "./Steps";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useLoader } from "@/hooks/useLoader";
import { PatWithPrivKey } from "@/types/api/api";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import Section from "../common/Section";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useAutosetup } from "@/hooks/useAutosetup";
import Autosetup from "../Autosetup";
import GitlabInstructionsSteps from "./GitlabInstructionsSteps";
import GithubInstructionsSteps from "./GithubInstructionsSteps";
import { useStore } from "@/zustand/globalStoreProvider";
import PatSection from "./PatSection";
import useDialogScroll from "../../hooks/useDialogScroll";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ContainerScanningDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
}) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const apiUrl = useStore((s) => s.apiUrl);

  const { Loader, isLoading } = useLoader();

  const { progress, pat, onCreatePat, handleAutosetup } =
    useAutosetup("container-scanning");

  useDialogScroll(open);

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Container-Scanning</DialogTitle>
          <DialogDescription>
            Container-Scanning is a security testing method that identifies
            known vulnerabilities in OCI images, like Docker Images. DevGuard
            provides a CLI tool to scan your project for known vulnerabilities
            in your Docker Images.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          <PatSection
            onCreatePat={onCreatePat}
            pat={pat}
            description={`Container-Scanning Token generated ${new Date().toLocaleString()}`}
          />
        </div>
        <hr />
        <Tab.Group>
          <Tab.List>
            <CustomTab>
              <Image
                src="/assets/github.svg"
                width={20}
                className="mr-2 inline dark:invert"
                height={20}
                alt="GitHub"
              />
              Using GitHub Actions
            </CustomTab>
            <CustomTab>
              <Image
                src="/assets/gitlab.svg"
                width={20}
                className="mr-2 inline"
                height={20}
                alt="GitLab"
              />
              Using GitLab CI/CD
            </CustomTab>
            <CustomTab>
              <Image
                src="/assets/docker.svg"
                width={20}
                className="mr-2 inline"
                height={20}
                alt="Docker Logo"
              />
              Using Docker
            </CustomTab>
          </Tab.List>
          <Tab.Panels className={"mt-2"}>
            <Tab.Panel>
              <GithubInstructionsSteps
                pat={pat}
                codeString={`# ----- START Container Scanning -----
name: Devguard Container Scanning Workflow
on:
    push:

jobs:
    container-scanning:
        uses: l3montree-dev/devguard-action/.github/workflows/container-scanning.yml@main
        with:
            asset-name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
        secrets:
            devguard-token: \${{ secrets.DEVGUARD_TOKEN }}
# ----- END Container Scanning -----`}
              />
            </Tab.Panel>
            <Tab.Panel>
              <GitlabInstructionsSteps
                isLoading={isLoading}
                handleAutosetup={handleAutosetup}
                progress={progress}
                Loader={Loader}
                pat={pat}
                codeString={`# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/container-scanning.yml"
  inputs:
    asset_name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
    token: "$DEVGUARD_TOKEN"
    api_url: ${apiUrl}
`}
              />
            </Tab.Panel>
            <Tab.Panel>
              <Steps>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Build the image using kaniko
                  </h3>

                  <CopyCode
                    language="shell"
                    codeString={`docker run --rm -v $(pwd):/workspace gcr.io/kaniko-project/executor:latest --dockerfile=/workspace/Dockerfile --context=/workspace --tarPath=/workspace/image.tar --no-push`}
                  ></CopyCode>
                </div>
                <div>
                  <h3 className="mb-4 mt-2 font-semibold">
                    Scan the produced .tar file image using devguard
                    container-scanning
                  </h3>
                  <CopyCode
                    language="shell"
                    codeString={`docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner@sha256:4aa67e829322df7c57213130cbe0bed19eed83d1d19988d5a00310fa1e524ed8 \\
    devguard-scanner container-scanning \\
        --path="/app/image.tar" \\
        --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
        --apiUrl="${apiUrl}" \\
        --token="${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}"`}
                  ></CopyCode>
                </div>
              </Steps>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <DialogFooter>
          <Button autoFocus variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContainerScanningDialog;
