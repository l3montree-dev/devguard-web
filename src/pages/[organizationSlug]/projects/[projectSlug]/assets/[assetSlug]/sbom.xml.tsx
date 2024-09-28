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
    const version = context.query.version as string | undefined;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/sbom.xml?scanType=" +
        context.query.scanType ?? "sca";

    const sbom = await apiClient(uri + (version ? "?version=" + version : ""));
    if (!sbom.ok) {
      context.res.statusCode = sbom.status;
      context.res.setHeader("Content-Type", "application/json");
      context.res.write(
        JSON.stringify({
          message: "Failed to fetch sbom",
          error: sbom.statusText,
        }),
      );
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
  {},
);
