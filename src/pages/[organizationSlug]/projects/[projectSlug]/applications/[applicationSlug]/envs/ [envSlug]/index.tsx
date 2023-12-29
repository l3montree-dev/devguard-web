import { GetServerSidePropsContext } from "next";
import React, { FunctionComponent } from "react";
import { withInitialState } from "../../../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../../../services/flawFixApi";
import Page from "../../../../../../../../components/Page";
import { EnvDTO } from "../../../../../../../../types/api/api";

interface Props {
  env: EnvDTO;
}
const Index: FunctionComponent<Props> = ({ env }) => {
  return (
    <Page title={env.name}>
      <div></div>
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
    const resp = await apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/applications/" +
        applicationSlug +
        "/envs/" +
        envSlug +
        "/",
    );

    const env = await resp.json();
    console.log(env);
    return {
      props: {
        env,
      },
    };
  }),
);
