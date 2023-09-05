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
import React, { useId } from "react";
import { classNames } from "../../utils/common";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
};
const Input = React.forwardRef<any, Props>((props, ref) => {
  const { label, ...rest } = props;
  const id = useId();
  return (
    <>
      {Boolean(label) && (
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-white"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        title={label}
        className={classNames(
          "block w-full rounded-sm border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-amber-400 sm:text-sm sm:leading-6",
          Boolean(label) ? "mt-2" : "",
        )}
        {...rest}
      />
    </>
  );
});

Input.displayName = "Input";

export default Input;
