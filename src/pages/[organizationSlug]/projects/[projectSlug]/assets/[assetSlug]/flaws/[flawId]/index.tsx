import Page from "@/components/Page";
import Sidebar from "@/components/Sidebar";

import FlawState from "@/components/common/FlawState";
import Select from "@/components/common/Select";
import Severity from "@/components/common/Severity";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/flawFixApi";
import { DetailedFlawDTO, FlawWithCVE } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FormEvent, FunctionComponent, useState } from "react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";
const CVECard = dynamic(() => import("@/components/CVECard"), {
  ssr: false,
});

interface Props {
  flaw: DetailedFlawDTO;
}

const Index: FunctionComponent<Props> = ({ flaw }) => {
  const router = useRouter();
  const r = router.asPath + "/events/";

  console.log(r);

  //console.log("Hier", flaw);
  const cve = flaw.cve;
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  //status state
  const [status, setStatus] = useState("");
  let [message, setMessage] = useState("");

  const handleStatusChange = (e: any) => {
    setStatus(e.target.value);
  };

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const events = flaw.events;
  console.log("Events", events);
  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();

    if (message === "") {
      message = "set as " + status;
    }

    const resp = browserApiClient(
      "/api/v1/organizations/" + router.asPath,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
          justification: message,
        }),
      },
      "",
    );

    window.location.href = router.asPath;
  };

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
            <div className="flex flex-row justify-between border-b bg-gray-50 p-4 font-semibold">
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
            <div className=" bg-white">
              <div>
                {events &&
                  events.map((event) => (
                    <div key={event.id}>
                      <div>event type: {event.type}</div>
                      <div>createdAt: {event.createdAt}</div>
                      <div> message : {event.justification}</div>
                      <div> userId : {event.userId}</div>
                    </div>
                  ))}

                <div>
                  <form onSubmit={handleSubmit}>
                    <Select
                      label={""}
                      value={status}
                      onChange={handleStatusChange}
                    >
                      <option>accepted</option>
                      <option>markedForMitigation</option>
                      <option>falsePositive</option>
                      <option>markedForTransfer</option>
                    </Select>
                    <input
                      type="text"
                      placeholder="Justification Message"
                      value={message}
                      onChange={handleMessageChange}
                    />
                    <Button>Submit</Button>
                  </form>
                </div>
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

    const resp = await (await apiClient(uri)).json();

    return {
      props: {
        flaw: resp,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    asset: withAsset,
    project: withProject,
  },
);

export default Index;
