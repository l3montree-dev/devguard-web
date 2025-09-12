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

import { ExternalTicketProvider, State } from "@/types/common";
import { defaultScanner } from "./view";
import { UserRole } from "@/types/api/api";

export function classNames(...classes: Array<string | undefined | Boolean>) {
  return classes.filter(Boolean).join(" ");
}

export const beautifyScannerId = (scannerId: string) => {
  return scannerId.replace(defaultScanner, "");
};

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

export const getEcosystem = (packageName?: string) => {
  if (!packageName) {
    return "";
  }

  if (packageName.startsWith("pkg:")) {
    packageName = packageName.split(":")[1].split("/")[0];
  } else if (packageName.includes("/")) {
    packageName = packageName.split("/")[0];
  }

  return packageName;
};

export const isNumber = (v: any): v is number => {
  if (v === null || v === undefined) {
    return false;
  }

  // checks for NaN
  return typeof v === "number" && v === v;
};

export const beautifyPurl = (purl: string) => {
  if (!purl) {
    return "";
  }
  const parts = purl.split("@");
  let first = parts[0];

  if (parts.length > 2) {
    // all other parts than the last
    first = parts.slice(0, parts.length - 1).join("@");
  }

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

export function allowedActionsCheck(
  currentUserRole: UserRole | null,
  memberRole?: UserRole | string,
): boolean {
  if (!memberRole) {
    return false;
  }

  if (currentUserRole === UserRole.Owner) {
    return true;
  }

  if (currentUserRole === UserRole.Admin && memberRole === UserRole.Member) {
    return true;
  }

  return false;
}

export const licenses = [
  { value: "bsd-1-clause", label: "BSD-1-Clause" },
  { value: "afl-3.0", label: "AFL-3.0" },
  { value: "apl-1.0", label: "APL-1.0" },
  { value: "apache-1.1", label: "Apache-1.1" },
  { value: "apache-2.0", label: "Apache-2.0" },
  { value: "apsl-2.0", label: "APSL-2.0" },
  { value: "artistic-1.0-perl", label: "Artistic-1.0-Perl" },
  { value: "artistic-1.0", label: "Artistic-1.0" },
  { value: "artistic-2.0", label: "Artistic-2.0" },
  { value: "aal", label: "AAL" },
  { value: "blueoak-1.0.0", label: "BlueOak-1.0.0" },
  { value: "bsl-1.0", label: "BSL-1.0" },
  { value: "bsd-2-clause-patent", label: "BSD-2-Clause-Patent" },
  { value: "cecill-2.1", label: "CECILL-2.1" },
  { value: "cern-ohl-p-2.0", label: "CERN-OHL-P-2.0" },
  { value: "cern-ohl-s-2.0", label: "CERN-OHL-S-2.0" },
  { value: "cern-ohl-w-2.0", label: "CERN-OHL-W-2.0" },
  { value: "mit-cmu", label: "MIT-CMU" },
  { value: "cddl-1.0", label: "CDDL-1.0" },
  { value: "cpal-1.0", label: "CPAL-1.0" },
  { value: "cpl-1.0", label: "CPL-1.0" },
  { value: "catosl-1.1", label: "CATOSL-1.1" },
  { value: "cal-1.0", label: "CAL-1.0" },
  { value: "cua-opl-1.0", label: "CUA-OPL-1.0" },
  { value: "epl-1.0", label: "EPL-1.0" },
  { value: "epl-2.0", label: "EPL-2.0" },
  { value: "ecos-2.0", label: "eCos-2.0" },
  { value: "ecl-1.0", label: "ECL-1.0" },
  { value: "ecl-2.0", label: "ECL-2.0" },
  { value: "efl-1.0", label: "EFL-1.0" },
  { value: "efl-2.0", label: "EFL-2.0" },
  { value: "entessa", label: "Entessa" },
  { value: "eudatagrid", label: "EUDatagrid" },
  { value: "eupl-1.2", label: "EUPL-1.2" },
  { value: "fair", label: "Fair" },
  { value: "frameworx-1.0", label: "Frameworx-1.0" },
  { value: "agpl-3.0-only", label: "AGPL-3.0-only" },
  { value: "gpl-2.0", label: "GPL-2.0" },
  { value: "gpl-3.0-only", label: "GPL-3.0-only" },
  { value: "lgpl-2.1", label: "LGPL-2.1" },
  { value: "lgpl-3.0-only", label: "LGPL-3.0-only" },
  { value: "lgpl-2.0-only", label: "LGPL-2.0-only" },
  { value: "hpnd", label: "HPND" },
  { value: "ipl-1.0", label: "IPL-1.0" },
  { value: "icu", label: "ICU" },
  { value: "intel", label: "Intel" },
  { value: "ipa", label: "IPA" },
  { value: "isc", label: "ISC" },
  { value: "jam", label: "Jam" },
  { value: "lppl-1.3c", label: "LPPL-1.3c" },
  { value: "bsd-3-clause-lbnl", label: "BSD-3-Clause-LBNL" },
  { value: "liliq-p-1.1", label: "LiLiQ-P-1.1" },
  { value: "liliq-rplus-1.1", label: "LiLiQ-Rplus-1.1" },
  { value: "liliq-r-1.1", label: "LiLiQ-R-1.1" },
  { value: "lpl-1.02", label: "LPL-1.02" },
  { value: "lpl-1.0", label: "LPL-1.0" },
  { value: "ms-pl", label: "MS-PL" },
  { value: "ms-rl", label: "MS-RL" },
  { value: "miros", label: "MirOS" },
  { value: "mit-0", label: "MIT-0" },
  { value: "mit", label: "MIT" },
  { value: "motosoto", label: "Motosoto" },
  { value: "mpl-1.1", label: "MPL-1.1" },
  { value: "mpl-2.0", label: "MPL-2.0" },
  { value: "mpl-1.0", label: "MPL-1.0" },
  { value: "mulanpsl-2.0", label: "MulanPSL-2.0" },
  { value: "multics", label: "Multics" },
  { value: "nasa-1.3", label: "NASA-1.3" },
  { value: "naumen", label: "Naumen" },
  { value: "nokia", label: "NOKIA" },
  { value: "nposl-3.0", label: "NPOSL-3.0" },
  { value: "ntp", label: "NTP" },
  { value: "ogtsl", label: "OGTSL" },
  { value: "olfl-1.3", label: "OLFL-1.3" },
  { value: "osl-2.1", label: "OSL-2.1" },
  { value: "osl-1.0", label: "OSL-1.0" },
  { value: "oldap-2.8", label: "OLDAP-2.8" },
  { value: "oset-pl-2.1", label: "OSET-PL-2.1" },
  { value: "php-3.0", label: "PHP-3.0" },
  { value: "php-3.01", label: "PHP-3.01" },
  { value: "psf-2.0", label: "PSF-2.0" },
  { value: "rpsl-1.0", label: "RPSL-1.0" },
  { value: "rpl-1.5", label: "RPL-1.5" },
  { value: "rpl-1.1", label: "RPL-1.1" },
  { value: "ofl-1.1", label: "OFL-1.1" },
  { value: "simpl-2.0", label: "SimPL-2.0" },
  { value: "sissl", label: "SISSL" },
  { value: "spl-1.0", label: "SPL-1.0" },
  { value: "bsd-3-clause", label: "BSD-3-Clause" },
  { value: "cnri-python", label: "CNRI-Python" },
  { value: "eupl-1.1", label: "EUPL-1.1" },
  { value: "ngpl", label: "NGPL" },
  { value: "osl-3.0", label: "OSL-3.0" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "qpl-1.0", label: "QPL-1.0" },
  { value: "rscpl", label: "RSCPL" },
  { value: "sleepycat", label: "Sleepycat" },
  { value: "watcom-1.0", label: "Watcom-1.0" },
  { value: "upl-1.0", label: "UPL-1.0" },
  { value: "ncsa", label: "NCSA" },
  { value: "unlicense", label: "Unlicense" },
  { value: "vsl-0.1", label: "VSL-0.1" },
  { value: "w3c-20150513", label: "W3C-20150513" },
  { value: "wxwindows", label: "wxWindows" },
  { value: "xnet", label: "Xnet" },
  { value: "zlib", label: "Zlib" },
  { value: "unicode-dfs-2015", label: "Unicode-DFS-2015" },
  { value: "ucl-1.0", label: "UCL-1.0" },
  { value: "zpl-2.0", label: "ZPL-2.0" },
  { value: "zpl-2.1", label: "ZPL-2.1" },
];
