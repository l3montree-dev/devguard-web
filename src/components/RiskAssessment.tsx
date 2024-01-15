import { classNames } from "@/utils/common";
import { ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import React, { FunctionComponent, useState } from "react";
import Button from "./common/Button";
import Select from "./common/Select";

const MarkdownEditor = dynamic(() => import("./common/MarkdownEditor"), {
  ssr: false,
});

const risks = [
  ["existence-threatening", "medium", "high", "critical", "critical"],
  ["substantial", "medium", "medium", "high", "critical"],
  ["limited", "low", "low", "medium", "high"],
  ["negligible", "low", "low", "low", "low"],
];

const riskClassNames = {
  low: "bg-green-200 border-green-500 text-green-800",
  medium: "bg-yellow-200 border-yellow-400 text-yellow-800",
  high: "bg-orange-200 border-orange-400 text-red-800",
  critical: "bg-red-200 border-red-400 text-red-800",
};

interface Props {
  onRiskAssessmentChange: (
    value: string,
    rawRepresentation: string,
    justification: string,
  ) => void;
  rawRiskAssessment: string;
  justification: string;
}

const getRawRepresentation = (index: number) => {
  const rowIndex = Math.floor(index / 5);
  const colIndex = (index % 5) - 1;

  return rowIndex + ":" + colIndex;
};
const RiskAssessment: FunctionComponent<Props> = ({
  onRiskAssessmentChange,
  rawRiskAssessment,
  justification: j,
}) => {
  const [selected, setSelected] = useState<string>(rawRiskAssessment);
  const [justification, setJustification] = useState<string | undefined>(j);

  const handleIndexClick = (index: number) => {
    setSelected(getRawRepresentation(index));
  };

  const handleRiskAssessmentChange = () => {
    onRiskAssessmentChange(selected, rawRiskAssessment, justification ?? "");
  };
  return (
    <div>
      <div className="risk-assessment gap-2">
        <div className="row-span-4 relative flex flex-col items-center justify-end">
          <div className="rotated-text font-semibold">Extent of damage</div>
          <div className="absolute right-0 h-full flex flex-col items-center bg-black w-0.5">
            <ChevronUpIcon className="w-6 h-6 absolute -top-2" />
          </div>
        </div>
        {risks.flat(1).map((el, idx) => {
          if (el in riskClassNames) {
            return (
              <div
                key={idx}
                onClick={() => handleIndexClick(idx)}
                className={classNames(
                  `rounded-lg border cursor-pointer hover:ring ring-blue-400 flex flex-row justify-center items-center`,
                  getRawRepresentation(idx) === selected
                    ? "ring-2 ring-blue-400"
                    : "",
                  riskClassNames[el as keyof typeof riskClassNames],
                )}
              >
                {el}
              </div>
            );
          }
          return (
            <span
              key={idx}
              style={{ height: 100 }}
              className="rotated-text text-sm justify-center items-center flex flex-col"
            >
              {el}
            </span>
          );
        })}
        <div className="col-start-3 text-sm text-center">rare</div>
        <div className="text-sm text-center">medium</div>
        <div className="text-sm text-center">frequently</div>
        <div className="text-sm text-center">very frequently</div>
        <div className="col-span-4 pt-2 col-start-3 font-semibold relative">
          Frequency of occurrence
          <div className="absolute top-0 h-0.5 flex flex-row items-center justify-end bg-black w-full">
            <ChevronRightIcon className="w-6 h-6 relative left-2" />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end mt-10">
        <div>
          <Select label="Mitigation Type">
            <option>Select mitigation type</option>
            <option>Accept</option>
            <option>Transfer</option>
            <option>Treat</option>
            <option>Avoid</option>
          </Select>
        </div>
      </div>
      <div className="mt-10 mb-4">
        <span className="font-semibold">Justification</span>
      </div>
      <MarkdownEditor
        placeholder="Write a justification for your risk assessment"
        value={justification ?? ""}
        setValue={setJustification}
      />
      <div className="mt-4 flex flex-row justify-end">
        <Button
          disabled={selected === undefined}
          onClick={handleRiskAssessmentChange}
        >
          Save Risk Assessment
        </Button>
      </div>
    </div>
  );
};

export default RiskAssessment;
