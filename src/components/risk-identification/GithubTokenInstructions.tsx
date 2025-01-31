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

const GithubTokenInstructions = ({ pat }: { pat?: string }) => {
  return (
    <>
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
        <h3 className="mb-4 mt-2 font-semibold">Create a new secret</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Name</span>
              <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
            </div>
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Secret</span>
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

export default GithubTokenInstructions;
