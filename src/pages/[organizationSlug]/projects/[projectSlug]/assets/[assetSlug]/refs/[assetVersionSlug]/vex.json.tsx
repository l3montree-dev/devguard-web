import { middleware } from "@/decorators/middleware";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { GetServerSideProps } from "next";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
const pipelineAsync = promisify(pipeline);

export default function SBOM() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = middleware(
  async (context, {}) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;
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
      "/refs/" +
      assetVersionSlug +
      "/artifacts/" +
      context.query.artifact +
      "/vex.json";

    const vex = await apiClient(uri);
    if (!vex.ok) {
      context.res.statusCode = vex.status;
      context.res.setHeader("Content-Type", "application/json");
      context.res.write(
        JSON.stringify({
          message: "Failed to fetch vex",
          error: vex.statusText,
        }),
      );
      context.res.end();
      return {
        props: {},
      };
    }
    // pipe the response to the client
    context.res.statusCode = 200;
    context.res.setHeader("Content-Type", "application/json");

    await pipelineAsync(
      vex.body as unknown as NodeJS.ReadableStream,
      context.res,
    );

    context.res.end();

    return {
      props: {},
    };
  },
  {},
);
