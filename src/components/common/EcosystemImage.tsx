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

import React from "react";
import Image from "next/image";
import { classNames, getEcosystem } from "@/utils/common";

const invertSvgOnDark = (ecosystem: string) => ["apk"].includes(ecosystem);

const EcosystemImage = ({
  packageName,
  size,
}: {
  packageName: string;
  size?: number;
}) => {
  if (
    [
      "golang",
      "npm",
      "apk",
      "pypi",
      "Maven",
      "crates.io",
      "Packagist",
      "RubyGems",
      "deb",
      "NuGet",
    ].includes(getEcosystem(packageName))
  ) {
    return (
      <Image
        alt={"Logo von " + getEcosystem(packageName)}
        width={size ?? 20}
        height={size ?? 20}
        className={classNames(
          "inline-block",
          invertSvgOnDark(getEcosystem(packageName)) ? "dark:invert" : "",
        )}
        src={
          "/logos/" +
          getEcosystem(packageName).toLowerCase() +
          "-svgrepo-com.svg"
        }
      />
    );
  }
  return null;
};

export default EcosystemImage;
