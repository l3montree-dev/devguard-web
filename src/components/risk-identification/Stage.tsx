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

import { classNames } from "@/utils/common";
import { Handle, Position } from "reactflow";
import Button from "../common/Button";

function Stage({
  title,
  description,
  sourceHandle,
  targetHandle,
  onButtonClick,
  comingSoon,
}: {
  title: string;
  description: string;
  sourceHandle?: boolean;
  targetHandle?: boolean;
  comingSoon?: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <div
      className={classNames(
        "flex w-60 items-center justify-between gap-x-6 rounded-lg border bg-white px-5 py-5 text-sm shadow-sm   transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-white",
        comingSoon ? "" : "scale-105 ring ring-blue-500",
      )}
    >
      {targetHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="target"
          id="left"
          position={Position.Left}
        />
      )}
      <div>
        <div>
          <span className="font-semibold">{title}</span>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>
        <div className="mt-10 flex flex-row">
          <Button
            className="flex-1"
            disabled={comingSoon}
            intent="primary"
            variant="outline"
            onClick={onButtonClick}
          >
            {comingSoon ? "Coming soon" : "Open Instructions"}
          </Button>
        </div>
      </div>
      {sourceHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="source"
          id="right"
          position={Position.Right}
        />
      )}
    </div>
  );
}

export default Stage;
