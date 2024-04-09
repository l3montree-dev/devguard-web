import Page from "@/components/Page";
import RiskAssessment from "@/components/RiskAssessment";
import Sidebar from "@/components/Sidebar";

import FlawState from "@/components/common/FlawState";
import Severity from "@/components/common/Severity";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { FlawWithCVE } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import { FunctionComponent, useState } from "react";
import Markdown from "react-markdown";
import Image from "next/image";
import { classNames } from "@/utils/common";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
const CVECard = dynamic(() => import("@/components/CVECard"), {
  ssr: false,
});

interface Props {
  flaw: FlawWithCVE;
}

const Index: FunctionComponent<Props> = ({ flaw }) => {
  const cve = flaw.cve;
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  const handleRiskAssessmentChange = () => {};
  return (
    <Page
      Sidebar={
        cve && (
          <Sidebar
            title={
              <div className="relative flex w-full flex-row items-center justify-between">
                CVE Information
                <span className="text-sm">
                  Source:
                  <Image
                    alt="NIST logo"
                    width={50}
                    height={10}
                    src="/NIST_logo.svg"
                  />
                </span>
              </div>
            }
          >
            <CVECard cve={cve} />
          </Sidebar>
        )
      }
      title={flaw.ruleId}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <h1 className="font-display text-4xl font-bold">{flaw.ruleId}</h1>
          <div className="mt-4 flex flex-row gap-2 text-sm">
            <FlawState state={flaw.state} />
            {cve && <Severity severity={cve.severity} />}
          </div>
          <div className="mt-4">
            <Markdown>{flaw.message?.replaceAll("\n", "\n\n")}</Markdown>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border ">
            <div className="flex flex-row justify-between border-b bg-slate-50 p-4 font-semibold">
              Risk Assessment
              <button
                onClick={() => setShowRiskAssessment((prev) => !prev)}
                className="cursor-pointer"
              >
                {showRiskAssessment ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div
              className={classNames(
                "bg-white p-4",
                showRiskAssessment ? "visible" : "hidden",
              )}
            ></div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, applicationSlug, envSlug, flawId } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/applications/" +
      applicationSlug +
      "/envs/" +
      envSlug +
      "/flaws/" +
      flawId;

    const resp = await (await apiClient(uri)).json();

    return {
      props: {
        flaw: resp,
      },
    };
  }),
);

export default Index;
