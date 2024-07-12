import Page from "@/components/Page";

import FlawState from "@/components/common/FlawState";

import Severity from "@/components/common/Severity";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import { DetailedFlawDTO, FlawEventDTO } from "@/types/api/api";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";

const ScoreFunnel = dynamic(() => import("@/components/common/ScoreFunnel"), {
  ssr: false,
});
interface Props {
  flaw: DetailedFlawDTO;
}

const Index: FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const [flaw, setFlaw] = useState<DetailedFlawDTO>(props.flaw);
  const cve = flaw.cve;

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  const form = useForm<{
    status: FlawEventDTO["type"];
    justification: string;
  }>();

  const handleSubmit = async (data: {
    status: FlawEventDTO["type"];
    justification: string;
  }) => {
    if (data.justification === "") {
      data.justification = "set as " + data.status;
    }

    const resp = await browserApiClient(
      "/api/v1/organizations/" + router.asPath,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      "",
    );

    setFlaw(await resp.json());
  };

  return (
    <Page
      Menu={assetMenu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>

          <span className="opacity-75">/</span>
          <span className="flex flex-row items-center gap-1">
            {flaw.cve?.cve ?? "Flaw Details"}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Flaw
            </Badge>
          </span>
        </span>
      }
      title={flaw.cve?.cve ?? "Flaw Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{flaw.cveId}</h1>

          <p className="mt-4 text-muted-foreground">{flaw.cve?.description}</p>

          <div className="mt-4 flex flex-row gap-2 text-sm">
            <FlawState state={flaw.state} />
            {cve && <Severity severity={cve.severity} />}
          </div>
          <div className="mb-16 mt-4">
            <Markdown>{flaw.message?.replaceAll("\n", "\n\n")}</Markdown>
          </div>

          <RiskAssessmentFeed
            flawName={flaw.cve?.cve ?? ""}
            events={flaw.events}
          />

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Update the status</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <FormField
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="falsePositive">
                                  False Positive
                                </SelectItem>
                                <SelectItem value="accepted">
                                  Accepted
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <small className="text-muted-foreground">
                      Select the current status to update the record accurately:
                      <ol>
                        <li>
                          Accepted: Accepts the risk the flaw poses to the
                          organization. It mutes the flaw. Detecting this flaw
                          again won&apos;t have an impact on the pipeline
                          result.
                        </li>
                        <li>
                          False Positive: Mutes the flaw permanently as it is
                          identified as a non-issue.
                        </li>
                      </ol>
                    </small>

                    <FormField
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justification</FormLabel>
                          <FormControl>
                            <Textarea className="bg-background" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-row justify-end">
                      <Button type="submit">Submit</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug, flawId } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/flaws/" +
      flawId;

    const resp: DetailedFlawDTO = await (await apiClient(uri)).json();

    return {
      props: {
        flaw: resp,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    asset: withAsset,
    project: withProject,
  },
);

export default Index;
