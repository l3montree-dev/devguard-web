import { GetServerSidePropsContext } from "next";
import React, { FunctionComponent } from "react";
import { withInitialState } from "../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../services/flawFixApi";
import { ApplicationDTO, EnvDTO } from "../../../../../../types/api/api";
import Page from "../../../../../../components/Page";
import ListItem from "../../../../../../components/common/ListItem";

interface Props {
  app: ApplicationDTO & {
    envs: Array<EnvDTO>;
  };
}
const Index: FunctionComponent<Props> = ({ app }) => {
  return (
    <Page title={app.name}>
      <p>{app.description}</p>
      <div className="mt-2">
        <b>Environments</b>
        <div className="flex flex-col gap-2">
          {app.envs.map((env) => (
            <ListItem
              key={env.id}
              title={env.name}
              description={env.description}
            />
          ))}
        </div>
      </div>
    </Page>
  );
};

export default Index;

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, applicationSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/applications/" +
        applicationSlug +
        "/",
    );

    const app = await resp.json();
    console.log(app);
    return {
      props: {
        app,
      },
    };
  }),
);
