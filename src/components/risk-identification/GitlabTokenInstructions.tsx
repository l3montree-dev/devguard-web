// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import React from "react";
import Image from "next/image";
import CopyCode from "../common/CopyCode";
import { Card, CardContent } from "../ui/card";

const GitlabTokenInstructions = ({ pat }: { pat?: string }) => {
  return (
    <>
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
          Scroll down to Variables section and click on &quot;Expand&quot;
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
        <h3 className="mb-4 mt-2 font-semibold">Create a new variable</h3>
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
              <span className="mb-2 block text-sm font-semibold">Key</span>
              <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
            </div>
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Value</span>
              <CopyCode
                language="shell"
                codeString={pat ?? "<PERSONAL ACCESS TOKEN>"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GitlabTokenInstructions;
