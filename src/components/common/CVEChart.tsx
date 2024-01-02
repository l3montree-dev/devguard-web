import { Pie } from "@nivo/pie";
import React, { FunctionComponent } from "react";
import colors from "tailwindcss/colors";
interface Props {
  baseScore: number;
  severity: string;
}
const CVEChart: FunctionComponent<Props> = ({ baseScore, severity }) => {
  return (
    <div
      className="flex flex-row items-center justify-center relative"
      style={{
        width: 200,
        height: 200,
      }}
    >
      <Pie
        width={200}
        height={200}
        innerRadius={0.8}
        isInteractive={false}
        enableArcLinkLabels={false}
        cornerRadius={5}
        enableArcLabels={false}
        colors={({ id, data }) => data.color}
        data={[
          {
            id: "low",
            value: (10 - baseScore).toFixed(1),
            color: "transparent",
          },
          {
            id: "high",
            value: baseScore.toFixed(1),
            color: colors.red[500],
          },
        ]}
      />
      <div className="text-xl text-center font-semibold absolute">
        <b className="text-4xl font-semibold">{baseScore}</b>
        <br />
        {severity}
      </div>
    </div>
  );
};

export default CVEChart;
