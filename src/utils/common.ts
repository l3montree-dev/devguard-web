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

export function classNames(...classes: Array<string | undefined | Boolean>) {
  return classes.filter(Boolean).join(" ");
}

export function toSearchParams(obj: Record<string, any>): URLSearchParams {
  const res = Object.keys(obj).reduce(
    (acc, key) => {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return new URLSearchParams(res as Record<string, string>);
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

export const isDarkModeEnabled = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

export const windowInnerWidth = () => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
};

export const windowInnerHeight = () => {
  if (typeof window === "undefined") return 0;
  return window.innerHeight;
};

export function cvssToColor(value: number) {
  if (value < 1 || value > 10) {
    return "rgb(255, 255, 255)";
    throw new Error("Value should be between 1 and 10 but was:" + value);
  }

  const colorStops = [
    { stop: 10, color: [225, 29, 72] }, // Red
    { stop: 8, color: [234, 88, 12] }, // Orange
    { stop: 6, color: [250, 204, 21] }, // Yellow
    { stop: 4, color: [5, 150, 105] }, // YellowGreen
    { stop: 1, color: [5, 150, 105] }, // Green
  ];

  function interpolateColor(
    color1: number[],
    color2: number[],
    factor: number,
  ) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }

  for (let i = 0; i < colorStops.length - 1; i++) {
    const stop1 = colorStops[i];
    const stop2 = colorStops[i + 1];

    if (value <= stop1.stop && value >= stop2.stop) {
      const factor = (value - stop2.stop) / (stop1.stop - stop2.stop);
      const color = interpolateColor(stop2.color, stop1.color, factor);
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  }

  // If value is exactly 1
  return `rgb(${colorStops[colorStops.length - 1].color.join(", ")})`;
}

export const getEcosystem = (packageName: string) => {
  if (packageName.startsWith("pkg:")) {
    packageName = packageName.split(":")[1].split("/")[0];
  } else if (packageName.includes("/")) {
    packageName = packageName.split("/")[0];
  }

  return packageName;
};

export const beautifyPurl = (purl: string) => {
  if (!purl) {
    return "";
  }
  const parts = purl.split("@");
  let first = parts[0];
  // remove everything before the first slash
  const slashIndex = first.indexOf("/");
  if (slashIndex > 0) {
    first = first.substring(slashIndex + 1);
  }

  return first;
};

export const extractVersion = (purl: string) => {
  if (!purl.includes("@")) {
    return "";
  }
  const parts = purl.split("@");
  let version = parts[parts.length - 1];
  if (version.startsWith("v")) {
    version = version.substring(1);
  }
  //remove any query parameters
  const qIndex = version.indexOf("?");
  if (qIndex > 0) {
    version = version.substring(0, qIndex);
  }

  // remove everything after "~" and "+"
  const tildeIndex = version.indexOf("~");
  if (tildeIndex > 0) {
    version = version.substring(0, tildeIndex);
  }
  const plusIndex = version.indexOf("+");
  if (plusIndex > 0) {
    version = version.substring(0, plusIndex);
  }

  return version;
};
