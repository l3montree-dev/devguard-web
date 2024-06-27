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

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SCADialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Software Composition Analysis</DialogTitle>
          <DialogDescription>
            Software Composition Analysis (SCA) is a security testing method
            that identifies known vulnerabilities in third-party and open source
            libraries. FlawFix provides a CLI tool to scan your project for
            known vulnerabilities in your dependencies.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Create a Personal Access Token
              </CardTitle>
              <CardDescription>
                To use the FlawFind CLI, you need to create a Personal Access
                Token. You can create such a token by clicking the button below.
              </CardDescription>
            </CardHeader>
            {personalAccessTokens.length > 0 && (
              <CardContent>
                <div className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-row gap-2">
                      <CopyCode
                        language="shell"
                        codeString={personalAccessTokens[0].token}
                      />
                    </div>

                    <span className=" block text-right text-sm text-destructive">
                      Make sure to copy the token. You won&apos;t be able to see
                      it ever again!
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
            {personalAccessTokens.length === 0 && (
              <CardFooter>
                <Button
                  variant={"default"}
                  onClick={() => onCreatePat({ description: "SCA Analysis" })}
                >
                  Create Personal Access Token
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
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
            <CustomTab>Using FlawFind CLI</CustomTab>
          </Tab.List>
          <Tab.Panels className={"mt-2"}>
            <Tab.Panel>
              <Steps>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Open the project settings in GitHub
                  </h3>
                  <small className="text-muted-foreground">
                    For example, for the flawfix project its following url:
                    https://github.com/l3montree-dev/flawfix/settings
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
                    For example, for the flawfix project its following url:
                    https://github.com/l3montree-dev/flawfix/settings/secrets/actions
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
                          codeString={`FLAWFIX_TOKEN`}
                        />
                      </div>
                      <div className="mb-4">
                        <span className="mb-2 block text-sm font-semibold">
                          Secret
                        </span>
                        <CopyCode
                          language="shell"
                          codeString={
                            personalAccessTokens.length > 0
                              ? personalAccessTokens[0].token
                              : "<PERSONAL ACCESS TOKEN>"
                          }
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

jobs:
  # ----- BEGIN Software Composition Analysis Job -----
  # Software Composition Analysis (SCA) to find vulnerabilities in project dependencies
  sca:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Run FlawFix Software Composition Analysis
      uses: l3montree-dev/flawfind@1.0.0
      with:
        scan-type: "sca"
        scan-ref: "."
        severity: "CRITICAL,HIGH"
        assetName: "${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}"
        apiUrl: "${config.flawFixApiUrl}"
        token: "{{github.secrets.FLAWFIX_TOKEN}}"
  # ----- END Software Composition Analysis Job -----`}
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
                codeString={`flawfind sca \\
             --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
             --apiUrl="${config.flawFixApiUrl}" \\
             --token="${personalAccessTokens.length > 0 ? personalAccessTokens[0].token : "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}"`}
              ></CopyCode>
            </Tab.Panel>
            <Tab.Panel>
              <CopyCode
                language="shell"
                codeString={`flawfind sca \\
             --assetName="${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug}" \\
             --apiUrl="${config.flawFixApiUrl}" \\
             --token="${personalAccessTokens.length > 0 ? personalAccessTokens[0].token : "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"}"`}
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

export default SCADialog;
