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
import Steps from "./Steps";

import { useAutosetup } from "@/hooks/useAutosetup";
import { useLoader } from "@/hooks/useLoader";
import Autosetup from "../Autosetup";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import GitlabInstructionsSteps from "./GitlabInstructionsSteps";
import GithubInstructionsSteps from "./GithubInstructionsSteps";

import { useStore } from "@/zustand/globalStoreProvider";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SigningDialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const apiUrl = useStore((s) => s.apiUrl);

  const { Loader, isLoading } = useLoader();

  const { progress, pat, onCreatePat, handleAutosetup } =
    useAutosetup("container-scanning");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = document.querySelector('[data-state="open"]');
        if (el) {
          el.scrollTo({ behavior: "instant", top: 0 });
        }
      });
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Image Signing</DialogTitle>
          <DialogDescription>
            Sign your container images to ensure their integrity and
            authenticity. You can verify the image&apos;s signature using
            kyverno. DevGuard builds upon the cosign project to provide a secure
            and easy-to-use signing experience.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          <Section
            className="mb-0 mt-0 pb-0 pt-0"
            description="To use the Devguard-Scanner, you need to create a Personal Access
              Token. You can create such a token by clicking the button below."
            title="Create a Personal Access Token"
            forceVertical
          >
            {pat && (
              <div className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-row gap-2">
                    <CopyCode language="shell" codeString={pat.privKey} />
                  </div>

                  <span className=" block text-right text-sm text-destructive">
                    Make sure to copy the token. You won&apos;t be able to see
                    it ever again!
                  </span>
                </div>
              </div>
            )}
            {!pat && (
              <div>
                <Button
                  variant={"default"}
                  onClick={() => onCreatePat({ description: "SCA Analysis" })}
                >
                  Create Personal Access Token
                </Button>
              </div>
            )}
          </Section>
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
                codeString={`# ----- START Container Image Signing -----
name: Devguard Container Scanning Workflow
on:
    push:

jobs:
    container-image-signing:
        uses: l3montree-dev/devguard-action/.github/workflows/sign.yml@main
        with:
            asset-name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
        secrets:
            devguard-token: \${{ secrets.DEVGUARD_TOKEN }}
# ----- END Container Image Signing ——`}
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
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/sign.yml"
  inputs:
    asset_name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
    token: "$DEVGUARD_TOKEN"
    api_url: ${apiUrl}
`}
                apiUrl={apiUrl}
              />
            </Tab.Panel>
            <Tab.Panel>
              <Steps>
                <div>
                  <h3 className="mb-4 mt-2 font-semibold">
                    Sign the image using the DevGuard-Scanner
                  </h3>
                  <CopyCode
                    language="shell"
                    codeString={`docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner@sha256:4aa67e829322df7c57213130cbe0bed19eed83d1d19988d5a00310fa1e524ed8 \\
    devguard-scanner sign \\
        --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
        --apiUrl="${apiUrl}" \\
        --token="${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}" <IMAGE_NAME>:<TAG>`}
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

export default SigningDialog;
