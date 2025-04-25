import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
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

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAutosetup } from "@/hooks/useAutosetup";
import { useStore } from "@/zustand/globalStoreProvider";
import { Button } from "../ui/button";
import GithubInstructionsSteps from "./GithubInstructionsSteps";
import GitlabInstructionsSteps from "./GitlabInstructionsSteps";
import PatSection from "./PatSection";
import useDialogScroll from "../../hooks/useDialogScroll";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const IacDialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const activeProject = useActiveProject();
  const asset = useActiveAsset();
  const apiUrl = useStore((s) => s.apiUrl);

  const { handleAutosetup, isLoading, Loader, progress, onCreatePat, pat } =
    useAutosetup("iac");

  useDialogScroll(open);

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Infrastructure as Code Scanning</DialogTitle>
          <DialogDescription>
            Use an IaC-Scanner to identify security vulnerabilities in your
            infrastructure code. All results will be manageable in your
            DevGuard-Dashboard
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          <PatSection
            onCreatePat={onCreatePat}
            pat={pat}
            description={`IaC Token generated ${new Date().toLocaleString()}`}
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
                codeString={`# DevSecOps Workflow Definition
# This workflow is triggered on every push to the repository
name: DevSecOps Workflow
on:
    push:

jobs:
  # ----- BEGIN Infrastructure as Code Scanning Job -----
  call-iac:
    uses: l3montree-dev/devguard-action/.github/workflows/iac.yml@main
    with:
      asset-name: "${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}"
      api-url: ${apiUrl}
    secrets:
      devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}"

  # ----- END Infrastructure as Code Scanning Job -----`}
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
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/iac.yml"
  inputs:
    asset_name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
    token: "$DEVGUARD_TOKEN"
    api_url: ${apiUrl}
`}
              />
            </Tab.Panel>
            <Tab.Panel>
              <CopyCode
                language="shell"
                codeString={`docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner:${config.devguardScannerTag} \\
    devguard-scanner iac \\
        --path="/app" \\
        --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
        --apiUrl="${apiUrl}" \\
        --token="${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}"`}
              ></CopyCode>
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

export default IacDialog;
