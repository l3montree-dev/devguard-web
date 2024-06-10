import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { GetServerSideProps } from "next";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { ServerResponse } from "node:http";
const pipelineAsync = promisify(pipeline);

export default function SBOM() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = middleware(
  async (context, { asset }) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    // check for version query parameter
    const version = context.query.version as string | undefined;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/sbom.xml";

    const sbom = await apiClient(uri + (version ? "?version=" + version : ""));
    if (!sbom.ok) {
      context.res.statusCode = sbom.status;
      context.res.setHeader("Content-Type", "application/xml");
      context.res.write(JSON.stringify(sbom));
      context.res.end();
      return {
        props: {},
      };
    }
    // pipe the response to the client
    context.res.statusCode = 200;
    context.res.setHeader("Content-Type", "application/xml");

    await pipelineAsync(
      sbom.body as unknown as NodeJS.ReadableStream,
      context.res,
    );

    context.res.end();

    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
