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

import { PatWithPrivKey } from "@/types/api/api";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Section from "../common/Section";

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
  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();

  const pat =
    personalAccessTokens.length > 0
      ? (personalAccessTokens[0] as PatWithPrivKey)
      : undefined;

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
              <Steps>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Open the project settings in GitHub
                  </h3>
                  <small className="text-muted-foreground">
                    For example, for the DevGuard project its following url:
                    https://github.com/l3montree-dev/devguard/settings
                  </small>
                  <div className="relative aspect-video w-full max-w-4xl">
                    <Image
                      alt="Open the project settings in GitHub"
                      className="object-contain"
                      src={"/assets/project-settings.png"}
                      fill
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Navigate to Secrets and Variables and choose actions
                    <br />
                    Press the button {"<"}New repository secret{">"}
                  </h3>
                  <small className="text-muted-foreground">
                    For example, for the DevGuard project its following url:
                    https://github.com/l3montree-dev/devguard/settings/secrets/actions
                  </small>
                  <div className="relative aspect-video w-full max-w-4xl">
                    <Image
                      alt="Open the project settings in GitHub"
                      className="object-contain"
                      src={"/assets/repo-secret.png"}
                      fill
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Create a new secret
                  </h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <span className="mb-2 block text-sm font-semibold">
                          Name
                        </span>
                        <CopyCode
                          language="shell"
                          codeString={`DEVGUARD_TOKEN`}
                        />
                      </div>
                      <div className="mb-4">
                        <span className="mb-2 block text-sm font-semibold">
                          Secret
                        </span>
                        <CopyCode
                          language="shell"
                          codeString={pat?.privKey ?? "<PERSONAL ACCESS TOKEN>"}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Create or insert the yaml snippet inside a .github/workflows
                    file
                  </h3>
                  <CopyCode
                    language="yaml"
                    codeString={`# DevSecOps Workflow Definition
# This workflow is triggered on every push to the repository
name: DevSecOps Workflow
on: 
  push:
  workflow_dispatch:

env:
    IMAGE_TAG: \${{ github.repository }}:\${{ github.sha }} # Setting the image tag to the repository name and the commit SHA

jobs:
    # ----- BEGIN Container-Scanning Job -----
    # This job scans the container images for known vulnerabilities


    # Build the image using Kaniko
    build-image:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v4
        - name: Build Docker image with Kaniko
        # Building the Docker image using Kaniko
        id: build_image
        uses: docker://gcr.io/kaniko-project/executor:v1.23.0
        with:
            args: --destination=\${{ env.IMAGE_TAG }} --context=/github/workspace --dockerfile=/github/workspace/Dockerfile --no-push --tarPath /github/workspace/image.tar
        - name: Setup crane
        uses: imjasonh/setup-crane@v0.1
        - name: Use crane to get the digest
        run: crane digest --tarball=image.tar > digest.txt
        - name: Upload artifact
        # Uploading the built Docker image as an artifact
        uses: actions/upload-artifact@v4
        with:
            name: docker-image
            path: image.tar
        - name: Upload digest
        # Uploading the built Docker image digest as an artifact
        uses: actions/upload-artifact@v4
        with:
            name: digest
            path: digest.txt

    # Image scanning job to detect vulnerabilities in the built oci image
    image-scanning:
        needs: build-image
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v4
        - uses: actions/download-artifact@v4
        with:
            name: docker-image
            path: .
        - name: Set up Git
        run: |
            git config --global --add safe.directory /github/workspace
        - name: DevGuard Container-Scanning
        uses: docker://ghcr.io/l3montree-dev/devguard-scanner@sha256:55736b9dc029762131ea31b7d5ec7a108f07df114520fefa82df28132f554ab8
        with:
            args: devguard-scanner container-scanning --assetName="l3montree-cybersecurity/projects/devguard/assets/devguard-web" --apiUrl="https://api.main.devguard.org" --token="\${{ secrets.DEVGUARD_TOKEN }}" --path="/github/workspace/image.tar"
    # ----- END Container Scanning -----`}
                  ></CopyCode>
                </div>
                <div>
                  <h3 className="mb-4 mt-2 font-semibold">
                    Commit and push the changes to the repository.
                    <br /> You can also trigger the workflow manually
                  </h3>
                </div>
              </Steps>
            </Tab.Panel>
            <Tab.Panel>
              <CopyCode
                language="shell"
                codeString={`docker run ghcr.io/l3montree-dev/devguard-scanner@sha256:4aa67e829322df7c57213130cbe0bed19eed83d1d19988d5a00310fa1e524ed8 devguard-scanner sca \\
             --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
             --apiUrl="${config.publicDevGuardApiUrl}" \\
             --token="${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}"`}
              ></CopyCode>
            </Tab.Panel>
            <Tab.Panel>
              <CopyCode
                language="shell"
                codeString={`docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner@sha256:4aa67e829322df7c57213130cbe0bed19eed83d1d19988d5a00310fa1e524ed8 \\
    devguard-scanner sca \\
        --path="/app" \\
        --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
        --apiUrl="${config.publicDevGuardApiUrl}" \\
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

export default ContainerScanningDialog;
