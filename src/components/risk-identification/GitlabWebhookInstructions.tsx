import React from "react";
import Image from "next/image";
import CopyCode from "../common/CopyCode";
import { Card, CardContent } from "../ui/card";

const GitlabWebhookInstructions = ({ apiUrl }: { apiUrl?: string }) => {
  return (
    <>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Open the Webhooks project settings in GitLab
        </h3>
        <small className="text-muted-foreground">
          It looks something like this:
          https://gitlab.com/l3montree/example-project/-/settings/hooks
        </small>
        <div className="relative mt-2 aspect-video w-full max-w-4xl">
          <Image
            alt="Open the Webhooks project settings in Gitlab"
            className="rounded-lg border object-fill"
            src={"/assets/gitlab-webhooks-settings.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Press the button {"<"}Add new webhook {">"}
        </h3>

        <div className="relative mt-2 aspect-video w-full max-w-4xl">
          <Image
            alt="Open the project settings in Gitlab"
            className="rounded-lg border object-fill"
            src={"/assets/gitlab-webhooks-var.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">Add the URL</h3>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Value</span>
              <CopyCode
                language="shell"
                codeString={apiUrl + "/api/v1/webhook/"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Choose the events you want to trigger the webhook, it is recommended
          to select this options:
        </h3>
        <ul className="list-inside list-disc">
          <li>Push events (All branches)</li>
          <li>Comments</li>
          <li>Confidential comments</li>
          <li>Issue events</li>
          <li>Confidential issue events</li>
          <li>SSL verification (Enable SSL verification)</li>
        </ul>
      </div>

      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Press the button {"<"}Save changes{">"}
        </h3>
      </div>
    </>
  );
};

export default GitlabWebhookInstructions;
