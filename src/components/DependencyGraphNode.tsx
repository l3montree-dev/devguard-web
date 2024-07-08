// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { AffectedPackage } from "@/types/api/api";
import { FunctionComponent } from "react";
import { Handle, Position } from "reactflow";
import tinycolor from "tinycolor2";

import { classNames } from "@/utils/common";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    affectedPackage: AffectedPackage;
    risk: number;
  };
}

const riskToTextColor = (risk: number) => {
  const red = new tinycolor("red");
  return red.lighten((1 - risk) * 50).isLight() ? "black" : "white";
};

export const riskToBgColor = (risk: number) => {
  const red = new tinycolor("red");
  const color = red.lighten((1 - risk) * 50).toString("hex");

  return color;
};

export const DependencyGraphNode: FunctionComponent<
  DependencyGraphNodeProps
> = (props) => {
  const color = riskToBgColor(props.data.risk);
  return (
    <div
      style={{
        maxWidth: 200,
        color:
          props.data.affectedPackage === undefined
            ? "black"
            : riskToTextColor(props.data.risk),
        backgroundColor:
          props.data.affectedPackage !== undefined ? color : "white",
      }}
      className={classNames("relative rounded border bg-white p-3 text-xs")}
    >
      <Handle type="target" position={Position.Right} />
      <div>
        <label htmlFor="text">{props.data.label}</label>
      </div>
      <Handle type="source" position={Position.Left} id="a" />
    </div>
  );
};
