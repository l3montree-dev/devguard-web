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

  const asset = useActiveAsset();
  const activeProject = useActiveProject();
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
                      className="rounded-lg border object-fill"
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
                      className="rounded-lg border object-fill"
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
                    codeString={`# ----- START Container Scanning -----
name: Devguard Container Scanning Workflow
on:
    push:
        branches:
        - main # change to primary branch

jobs:
    container-scanning:
        uses: l3montree-dev/devguard-action/.github/workflows/container-scanning.yml@main
        with:
            asset-name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
        secrets:
            devguard-token: \${{ secrets.DEVGUARD_TOKEN }}
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
              <Autosetup
                isLoading={isLoading}
                handleAutosetup={handleAutosetup}
                progress={progress}
                Loader={Loader}
              />
              <div className="my-8 flex flex-row items-center text-center text-muted-foreground">
                <div className="flex-1 border-t-2 border-dotted" />
                <span className="px-5">OR</span>
                <div className="flex-1 border-t-2 border-dotted" />
              </div>
              <Steps>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Open the CI/CD project settings in GitLab
                  </h3>
                  <small className="text-muted-foreground">
                    It looks something like this:
                    https://gitlab.com/l3montree/example-project/-/settings/ci_cd
                  </small>
                  <div className="relative mt-2 aspect-video w-full max-w-4xl">
                    <Image
                      alt="Open the project settings in GitHub"
                      className="rounded-lg border object-fill"
                      src={"/assets/gitlab-project-settings.png"}
                      fill
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Scroll down to Variables section and click on
                    &quot;Expand&quot;
                    <br />
                    Press the button {"<"}Add variable{">"}
                  </h3>

                  <div className="relative mt-2 aspect-video w-full max-w-4xl">
                    <Image
                      alt="Open the project settings in GitHub"
                      className="rounded-lg border object-fill"
                      src={"/assets/gitlab-secret.png"}
                      fill
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Create a new variable
                  </h3>
                  <div className="relative mt-2 aspect-video w-full max-w-4xl">
                    <Image
                      alt="Open the project settings in GitHub"
                      className="rounded-lg border object-fill"
                      src={"/assets/gitlab-var-settings.png"}
                      fill
                    />
                  </div>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <span className="mb-2 block text-sm font-semibold">
                          Key
                        </span>
                        <CopyCode
                          language="shell"
                          codeString={`DEVGUARD_TOKEN`}
                        />
                      </div>
                      <div className="mb-4">
                        <span className="mb-2 block text-sm font-semibold">
                          Value
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
                    Create or insert the yaml snippet inside a .gitlab-ci.yaml
                    file
                  </h3>
                  <CopyCode
                    language="yaml"
                    codeString={`# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
- component: gitlab.com/l3montree/devguard/container-scanning@~latest
    inputs:
      asset_name: ${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}
      token: "$DEVGUARD_TOKEN"
`}
                  ></CopyCode>
                </div>
                <div>
                  <h3 className="mb-4 mt-2 font-semibold">
                    Commit and push the changes to the repository.
                  </h3>
                </div>
              </Steps>
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
        --apiUrl="${config.publicDevGuardApiUrl}" \\
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
