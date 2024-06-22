import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { encodeObjectBase64 } from "@/services/encodeService";
import { browserApiClient } from "@/services/flawFixApi";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";
import Button from "../common/Button";
import CopyCode from "../common/CopyCode";
import CustomTab from "../common/CustomTab";
import Input from "../common/Input";
import Modal from "../common/Modal";
import Section from "../common/Section";
import Small from "../common/Small";
import Steps from "./Steps";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SCADialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();
  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();

  const handleOpenPullRequest = () => {};
  const fetchAvailableGithubRepos = () => {};

  useEffect(() => {
    browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/integrations/repositories?provider=github",
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return [];
      })
      .then((data) => {
        console.log(data);
      });
  }, []);

  return (
    <Modal title="Software Composition Analysis" open={open} setOpen={setOpen}>
      <Small>
        Software Composition Analysis (SCA) is a security testing method that
        identifies known vulnerabilities in third-party and open source
        libraries. FlawFix provides a CLI tool to scan your project for known
        vulnerabilities in your dependencies.
      </Small>

      <div className="mb-12 mt-6">
        <Section
          highlightBg
          description="To use the FlawFind CLI, you need to create a Personal Access
                Token. You can create such a token by clicking the button below."
          title="Create a Personal Access Token"
        >
          {personalAccessTokens.length === 0 ? (
            <div className="flex flex-row justify-end">
              <Button
                intent="primary"
                onClick={() => onCreatePat({ description: "SCA Analysis" })}
              >
                Create Personal Access Token
              </Button>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-row gap-2">
                  <Input
                    variant="light"
                    readOnly
                    className="border-none bg-white dark:bg-slate-600"
                    value={personalAccessTokens[0].token}
                  />
                </div>
                <p className="mb-4 text-right text-sm">
                  {personalAccessTokens[0].description}
                </p>
                <span className=" block text-right text-sm text-red-500">
                  Make sure to copy the token. You won&apos;t be able to see it
                  ever again!
                </span>
              </div>
            </div>
          )}
        </Section>
      </div>
      <Tab.Group>
        <Tab.List className={"flex flex-row flex-wrap gap-2"}>
          <CustomTab>
            <Image
              src="/assets/github.svg"
              width={20}
              className="mr-2 inline dark:invert"
              height={20}
              alt="GitHub"
            />
            Using the FlawFix GitHub App (recommended)
          </CustomTab>
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
        <Tab.Panels className={"mt-10"}>
          <Tab.Panel>
            <Button
              href={
                "https://github.com/apps/flawfix/installations/new?state=" +
                encodeObjectBase64({
                  orgSlug: activeOrg.slug,
                  redirectTo: router.asPath + "?openDialog=sca",
                })
              }
            >
              Install GitHub App
            </Button>
          </Tab.Panel>
          <Tab.Panel>
            <Steps>
              <div className="mb-10">
                <h3 className="mb-4 mt-2 font-semibold">
                  Open the project settings in GitHub
                </h3>
                <Small>
                  For example, for the flawfix project its following url:
                  https://github.com/l3montree-dev/flawfix/settings
                </Small>
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
                <Small>
                  For example, for the flawfix project its following url:
                  https://github.com/l3montree-dev/flawfix/settings/secrets/actions
                </Small>
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
                <h3 className="mb-4 mt-2 font-semibold">Create a new secret</h3>
                <div className="rounded-lg border bg-zinc-200 p-4 dark:border-slate-700 dark:bg-transparent">
                  <div className="mb-4">
                    <span className="mb-2 block text-sm font-semibold">
                      Name
                    </span>
                    <CopyCode language="shell" codeString={`FLAWFIX_TOKEN`} />
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
                </div>
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

      <div className="mt-6 flex flex-row justify-end border-t pt-6 dark:border-t-slate-700">
        <Button autoFocus intent="primary" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default SCADialog;
