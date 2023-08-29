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

import React, { FunctionComponent, ReactNode } from "react";

interface Props {
  title: string;
  description?: ReactNode;
  children: React.ReactNode;
  id?: string;
}
const Section: FunctionComponent<Props> = (props) => {
  return (
    <div id={props.id} className="border-b border-white/10 mb-6 pb-6">
      <h2 className="text-base font-semibold leading-7 text-white">
        {props.title}
      </h2>
      {props.description !== undefined && (
        <p className="mt-1 text-sm leading-6 text-blue-200">
          {props.description}
        </p>
      )}
      <div className="mt-6">{props.children}</div>
    </div>
  );
};

export default Section;
