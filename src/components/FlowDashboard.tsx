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

import React from "react";
import ReactFlow, { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./Flow/CustomNode";
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: {
      name: "Unhandeled Flaws",
      value: "12",
      state: "unhandled",
      icon: ShieldExclamationIcon,
    },
    position: { x: 385, y: 5 },
  },
  {
    id: "2",
    type: "custom",
    data: {
      name: "Accepted",
      value: "6",
      state: "accepted",
      icon: ShieldCheckIcon,
    },
    position: { x: 100, y: 220 },
  },
  {
    id: "3",
    type: "custom",
    data: {
      name: "Avoided",
      value: "2",
      state: "avoided",
      icon: ShieldCheckIcon,
    },
    position: { x: 300, y: 220 },
  },
  {
    id: "4",
    type: "custom",
    data: {
      name: "Fix - Pending",
      value: "14",
      state: "pendingFix",
      icon: ClockIcon,
    },
    position: { x: 500, y: 220 },
  },
  {
    id: "5",
    type: "custom",
    data: {
      name: "Transfer - Pending",
      value: "32",
      state: "pendingTransfered",
      icon: ClockIcon,
    },
    position: { x: 700, y: 220 },
  },
  {
    id: "6",
    type: "custom",
    data: {
      name: "Verified Closed",
      value: "712",
      state: "verifiedFix",
      icon: ShieldCheckIcon,
    },
    position: { x: 580, y: 440 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e1-4", source: "1", target: "4", animated: true },
  { id: "e1-5", source: "1", target: "5", animated: true },
  { id: "e4-6", source: "4", target: "6", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
];

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowDashboard() {
  return (
    <div style={{ width: "2s0vw", height: "100vh" }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
      />
    </div>
  );
}
