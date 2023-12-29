import { GetServerSidePropsContext } from "next";
import React, { FunctionComponent, useState } from "react";
import { withInitialState } from "../../../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../../../services/flawFixApi";
import Page from "../../../../../../../../components/Page";
import { EnvDTO, PersonalAccessTokenDTO } from "@/types/api/api";
import Input from "../../../../../../../../components/common/Input";
import { config } from "../../../../../../../../config";
import Button from "../../../../../../../../components/common/Button";
import { useForm } from "react-hook-form";
import { createPat } from "../../../../../../../../services/patService";
import { toast } from "../../../../../../../../components/Toaster";

interface Props {
  env: EnvDTO;
}
const Index: FunctionComponent<Props> = (props) => {
  const { register, handleSubmit, reset } = useForm<{ description: string }>();

  const cmd =
    "cat report.sarif.json | curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer <PERSONAL ACCESS TOKEN>' -d @- " +
    config.flawFixApiUrl +
    "/api/v1/vulnreports/";

  const handleCopy = () => {
    // use the clipboard api
    navigator.clipboard.writeText(cmd);
    toast({
      title: "Copied",
      msg: "Command copied to clipboard",
      intent: "success",
    });
  };

  return (
    <Page title={props.env.name}>
      <div className="text-sm">
        Adding a vulnerability report to this environment is as easy as running
        the following command:
        <div className="mt-2 gap-2 flex flex-row">
          <Input disabled value={cmd} />
          <Button onClick={handleCopy} className="whitespace-nowrap">
            Copy
          </Button>
          <Button
            href="/user-settings#pat"
            intent="primary"
            variant="outline"
            className="whitespace-nowrap"
          >
            Create new Personal Access Token
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default Index;

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, applicationSlug, envSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const [resp] = await Promise.all([
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/applications/" +
          applicationSlug +
          "/envs/" +
          envSlug +
          "/",
      ),
    ]);

    // fetch a personal access token from the user

    const [env] = await Promise.all([resp.json()]);

    return {
      props: {
        env,
      },
    };
  }),
);
