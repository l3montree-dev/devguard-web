import { GetServerSidePropsContext } from "next";
import React, { FunctionComponent } from "react";
import { withInitialState } from "../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../services/flawFixApi";
import { ApplicationDTO, EnvDTO } from "../../../../../../types/api/api";
import Page from "../../../../../../components/Page";
import ListItem from "../../../../../../components/common/ListItem";
import Button from "../../../../../../components/common/Button";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import { useRouter } from "next/router";

interface Props {
  app: ApplicationDTO & {
    envs: Array<EnvDTO>;
  };
}
const Index: FunctionComponent<Props> = ({ app }) => {
  const router = useRouter();
  return (
    <Page title={app.name}>
      <div className="bg-gray-100 rounded-md text-sm mb-10 px-2 py-2">
        <p>{app.description}</p>
      </div>
      <div className="mt-2">
        <b>Environments</b>
        <div className="flex mt-4 flex-col gap-2">
          {app.envs.map((env) => (
            <ListItem
              key={env.id}
              title={env.name}
              description={env.description}
              Button={
                <Button
                  href={`${router.asPath}/envs/${env.slug}`}
                  variant="outline"
                  intent="primary"
                >
                  View Environment
                </Button>
              }
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
