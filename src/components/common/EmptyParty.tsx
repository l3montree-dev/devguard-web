// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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

import { FunctionComponent, ReactNode } from "react";
import SkeletonListItem from "./SkeletonListItem";

interface Props {
  title: string;
  description: string;
  Button?: ReactNode;
}
const EmptyParty: FunctionComponent<Props> = ({
  title,
  description,
  Button,
}) => {
  return (
    <div className="relative">
      <div className="mt-5 flex flex-col gap-2 opacity-80">
        <div className="scale-90 blur-sm">
          <SkeletonListItem />
        </div>
        <div className="scale-95 blur-sm">
          <SkeletonListItem />
        </div>
        <div className="scale-90 blur-sm">
          <SkeletonListItem />
        </div>
      </div>
      <div className="absolute top-1/2 w-full -translate-y-1/2 text-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex flex-row justify-center">
          <p className="mt-2 w-2/3 text-muted-foreground">{description}</p>
        </div>
        {Boolean(Button) && <div className="mt-6">{Button}</div>}
      </div>
    </div>
  );
};

export default EmptyParty;
