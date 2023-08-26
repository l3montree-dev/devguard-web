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
import React, { FunctionComponent, useId } from "react";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  help?: string;
};
const Checkbox: FunctionComponent<Props> = (props) => {
  const { label, ...rest } = props;
  const id = useId();
  return (
    <div className="flex gap-x-3">
      <input
        className="h-4 relative top-1 w-4 rounded border-white/10 bg-white/5 text-amber-400 indeterminate:text-black focus:ring-amber-400 focus:ring-offset-gray-900"
        {...rest}
      ></input>
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-white"
        >
          {label}
        </label>
        {props.help && (
          <small className="text-sm text-gray-400">{props.help}</small>
        )}
      </div>
    </div>
  );
};

export default Checkbox;
