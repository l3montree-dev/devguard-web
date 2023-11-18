// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { State } from "@/types/common";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function getBGColorByState(state: State) {
  switch (state) {
    case "verifiedFix":
      return "bg-blue-500";
    case "pendingFix":
      return "bg-gray-400";
    case "pendingTransfered":
      return "bg-gray-400";
    case "unhandled":
      return "bg-red-500";
    case "accepted":
      return "bg-gray-600";
    case "avoided":
      return "bg-gray-600";
    case "verifiedTransfered":
      return "bg-blue-500";
    default:
      return "bg-gray-600";
  }
}

export const applyClsxConfig = (
  config: Record<string, any>,
  props: Record<string, any>,
): string => {
  // iterate over the blok keys and check if a corresponding config key exists.
  let classNames: Array<string> = [];
  Object.entries(props).forEach(([key, value]) => {
    if (key in config) {
      classNames.push(config[key][value]);
    }
  });

  return classNames.join(" ");
};

export const hasErrors = (errors: Record<string, any>) => {
  return Object.keys(errors).length > 0;
};
