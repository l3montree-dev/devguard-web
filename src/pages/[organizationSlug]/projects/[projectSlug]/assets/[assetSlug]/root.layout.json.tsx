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
    const { organizationSlug, projectSlug, assetSlug } = context.params!;
    // check for version query parameter
    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/in-toto/root.layout.json";

    const rootLayout = await apiClient(uri);
    if (!rootLayout.ok) {
      context.res.statusCode = rootLayout.status;
      context.res.setHeader("Content-Type", "application/json");
      context.res.write(
        JSON.stringify({
          message: "Failed to fetch root.layout",
          error: rootLayout.statusText,
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
      rootLayout.body as unknown as NodeJS.ReadableStream,
      context.res,
    );

    context.res.end();

    return {
      props: {},
    };
  },
  {},
);
