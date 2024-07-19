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
import { getEcosystem } from "@/utils/common";

const EcosystemImage = ({ packageName }: { packageName: string }) => {
  console.log(getEcosystem(packageName));
  if (
    [
      "golang",
      "npm",
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
        width={15}
        height={15}
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
