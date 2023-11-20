import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";
import { withInitialState } from "../../../../decorators/withInitialState";
import { withSession } from "../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../services/flawFixApi";
import { ProjectDTO } from "../../../../types/api";

interface Props {
  project: ProjectDTO;
}
const Index: FunctionComponent<Props> = ({ project }) => {
  return <Page title={project.name}>Hallo</Page>;
};

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug } = context.params!;
    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/projects/" + projectSlug + "/",
    );

    return {
      props: {
        project: await resp.json(),
      },
    };
  }),
);
export default Index;
