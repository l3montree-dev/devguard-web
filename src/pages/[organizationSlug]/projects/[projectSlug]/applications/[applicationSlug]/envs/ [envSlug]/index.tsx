import { EnvDTO, FlawWithLastEvent, Paged } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../../../../../components/Page";
import { toast } from "../../../../../../../../components/Toaster";
import Button from "../../../../../../../../components/common/Button";
import Input from "../../../../../../../../components/common/Input";
import { config } from "../../../../../../../../config";
import { withInitialState } from "../../../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../../../services/flawFixApi";

interface Props {
  env: EnvDTO;
  flaws: Paged<FlawWithLastEvent>;
}
const Index: FunctionComponent<Props> = (props) => {
  const cmd =
    "cat report.sarif.json | curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer <PERSONAL ACCESS TOKEN>' -d @- " +
    config.flawFixApiUrl +
    "/api/v1/vulnreports/" +
    props.env.id;

  const handleCopy = () => {
    // use the clipboard api
    navigator.clipboard.writeText(cmd);
    toast({
      title: "Copied",
      msg: "Command copied to clipboard",
      intent: "success",
    });
  };

  console.log(props);
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
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/applications/" +
      applicationSlug +
      "/envs/" +
      envSlug +
      "/";
    const [resp, flawResp] = await Promise.all([
      apiClient(uri),
      apiClient(uri + "flaws/"),
    ]);

    // fetch a personal access token from the user

    const [env, flaws] = await Promise.all([resp.json(), flawResp.json()]);

    return {
      props: {
        env,
        flaws,
      },
    };
  }),
);
