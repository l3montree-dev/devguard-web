// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { classNames } from "@/utils/common";
import React, { FunctionComponent, ReactNode } from "react";

interface Props {
  title: string;
  description?: ReactNode;
  children: React.ReactNode;
  id?: string;
  Button?: ReactNode;
  forceVertical?: boolean;
  Icon?: ReactNode;
}
const Section: FunctionComponent<Props> = (props) => {
  return (
    <div id={props.id} className={classNames("mb-6 mt-4 pb-6")}>
      <div
        className={classNames(
          "flex",
          props.forceVertical ? "flex-col gap-4" : "flex-row gap-8",
        )}
      >
        <div
          className={classNames(
            props.forceVertical
              ? "flex flex-row items-end justify-between gap-6"
              : "w-96",
          )}
        >
          <div>
            <h2 className="flex flex-row items-center gap-2 text-base font-semibold leading-7 text-black dark:text-white">
              {props.Icon}
              {props.title}
            </h2>
            {props.description !== undefined && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {props.description}
              </p>
            )}
          </div>
          {props.Button}
        </div>
        <div className="flex flex-1 flex-col justify-end gap-4">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Section;
