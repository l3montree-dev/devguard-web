// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { classNames, getBGColorByState } from "@/utils/common";
import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

const CustomNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  return (
    <>
      <div className="rounded-lg bg-white px-4 py-4 shadow">
        <dt>
          <div
            className={classNames(
              getBGColorByState(data.state),
              "absolute rounded-md p-3",
            )}
          >
            <data.icon className="h-6 w-6 text-white " aria-hidden="true" />
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-600">
            {data.name}
          </p>
        </dt>
        <dd className="ml-16 flex items-baseline">
          <p className="text-xl font-semibold text-gray-900">{data.value}</p>
        </dd>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-gray-700"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-gray-700"
      />
    </>
  );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);
