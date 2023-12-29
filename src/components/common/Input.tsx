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
import { FieldError } from "react-hook-form";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
  variant?: "light" | "dark";
  error?: FieldError;
};
const Input = React.forwardRef<any, Props>((props, ref) => {
  const { label, variant = "light", error, className, ...rest } = props;
  const id = useId();

  return (
    <>
      {Boolean(label) && (
        <label htmlFor={id} className="block text-sm font-medium leading-6">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        title={label}
        className={classNames(
          "block w-full rounded-md text-black py-1.5 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-400 focus:border-gray-200 border border-gray-200 shadow-sm sm:text-sm sm:leading-6",
          Boolean(label) ? "mt-2" : "",
          "bg-white",
          error ? "ring-red-500" : "ring-white/10",
          className,
        )}
        {...rest}
      />
      {error && <small className="text-sm text-red-500">{error.message}</small>}
    </>
  );
});

Input.displayName = "Input";

export default Input;
