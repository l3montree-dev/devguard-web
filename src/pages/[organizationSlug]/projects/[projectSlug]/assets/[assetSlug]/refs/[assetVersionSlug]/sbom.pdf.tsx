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
      "/sbom.pdf?";

    const sbom = await apiClient(uri);
    if (!sbom.ok) {
      context.res.statusCode = sbom.status;
      context.res.setHeader("Content-Type", "application/json");
      context.res.write(
        JSON.stringify({
          message: "Failed to fetch sbom pdf",
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
    context.res.setHeader("Content-Type", "application/pdf");
    context.res.setHeader(
      "Content-Disposition",
      "attachment; filename=sbom.pdf",
    );

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
