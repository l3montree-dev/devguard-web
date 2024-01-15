import { FlawWithCVE } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import CVEChart from "./common/CVEChart";
import DateString from "./common/DateString";
import P from "./common/P";

interface Props {
  cve: FlawWithCVE["cve"];
}

const impactToNumber = (impact: string) => {
  switch (impact) {
    case "NONE":
      return 0;
    case "LOW":
      return 1;
    case "MEDIUM":
      return 2;
    case "HIGH":
      return 3;
    default:
      return 0;
  }
};

const CVECard: FunctionComponent<Props> = ({ cve }) => {
  const [moreDetails, setMoreDetails] = useState(false);

  if (!cve) {
    return null;
  }
  return (
    <div className="w-full text-black text-sm p-4 relative rounded-lg">
      <div className="absolute -top-10 right-4 flex items-center flex-row gap-2"></div>
      {cve && (
        <div className="flex flex-row justify-center mb-4">
          <CVEChart severity={cve.severity} baseScore={cve.cvss} />
        </div>
      )}
      <b>Description:</b>
      <P value={cve.description} />

      <div className="flex flex-row justify-end mt-4">
        <button
          onClick={() => setMoreDetails(!moreDetails)}
          className="text-blue-600 gap-2 flex flex-row items-center whitespace-nowrap"
        >
          {moreDetails ? "Less" : "More"} Details{" "}
          {moreDetails ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className={classNames(!moreDetails ? "hidden" : "visible")}>
        <div>
          <table className="border-separate border-spacing-2 -ml-2">
            <tbody>
              <tr>
                <td>
                  <b>CVE:</b>
                </td>
                <td>{cve.cve}</td>
              </tr>
              <tr>
                <td>
                  <b>Published:</b>
                </td>
                <td>
                  <DateString date={new Date(cve.datePublished)} />
                </td>
              </tr>
              <tr>
                <td>
                  <b>Base Score:</b>
                </td>
                <td>{cve.cvss}</td>
              </tr>
              <tr>
                <td>
                  <b>Impact Score:</b>
                </td>
                <td>{cve.impactScore}</td>
              </tr>
              <tr>
                <td>
                  <b>Exploitability Score:</b>
                </td>
                <td>{cve.exploitabilityScore}</td>
              </tr>
              <tr>
                <td>
                  <b>Attack Vector:</b>
                </td>
                <td>{cve.attackVector}</td>
              </tr>
              <tr>
                <td>
                  <b>Attack Complexibility:</b>
                </td>
                <td>{cve.attackComplexity}</td>
              </tr>
              <tr>
                <td>
                  <b>Privileges Required:</b>
                </td>
                <td>{cve.privilegesRequired}</td>
              </tr>
              <tr>
                <td>
                  <b>User Interaction:</b>
                </td>
                <td>{cve.userInteractionRequired}</td>
              </tr>

              <tr>
                <td>
                  <b>Confidentiality Impact:</b>
                </td>
                <td>{cve.confidentialityImpact}</td>
              </tr>
              <tr>
                <td>
                  <b>Integrity Impact:</b>
                </td>
                <td>{cve.integrityImpact}</td>
              </tr>
              <tr>
                <td>
                  <b>Availability Impact:</b>
                </td>
                <td>{cve.availabilityImpact}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {cve.cwes.length > 0 && (
          <div className="mt-4">
            <span className="font-semibold">Related CWEs</span>
            {cve.cwes.map((cwe) => (
              <div key={cwe.cwe}>
                <span>
                  {cwe.cwe}: {cwe.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVECard;
