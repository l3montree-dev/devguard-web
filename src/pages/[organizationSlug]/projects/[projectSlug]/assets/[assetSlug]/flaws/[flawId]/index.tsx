import Page from "@/components/Page";
import RiskAssessment from "@/components/RiskAssessment";
import Sidebar from "@/components/Sidebar";

import FlawState from "@/components/common/FlawState";
import Severity from "@/components/common/Severity";
import { withOrg } from "@/decorators/withOrg";
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
              <div className="relative flex flex-row items-center justify-between w-full">
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
      <div className="flex gap-4 flex-row">
        <div className="flex-1">
          <h1 className="font-display font-bold text-4xl">{flaw.ruleId}</h1>
          <div className="flex mt-4 flex-row gap-2 text-sm">
            <FlawState state={flaw.state} />
            {cve && <Severity severity={cve.severity} />}
          </div>
          <div className="mt-4">
            <Markdown>{flaw.message?.replaceAll("\n", "\n\n")}</Markdown>
          </div>

          <div className="border mt-4 overflow-hidden rounded-lg ">
            <div className="font-semibold flex flex-row justify-between p-4 bg-slate-50 border-b">
              Risk Assessment
              <button
                onClick={() => setShowRiskAssessment((prev) => !prev)}
                className="cursor-pointer"
              >
                {showRiskAssessment ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <div
              className={classNames(
                "p-4 bg-white",
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
  withOrg(async (context: GetServerSidePropsContext) => {
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
