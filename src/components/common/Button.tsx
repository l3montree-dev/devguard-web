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

import React, { FunctionComponent } from "react";
import { applyClsxConfig, classNames } from "../../utils/common";

const cslxConfig = {
  default: "rounded-md px-2 transition-all text-sm py-2 font-medium",
  variant: {
    "solid+danger": "bg-blue-500 text-white hover:bg-blue-600",
    "outline+danger": "bg-transparent text-blue-500 hover:bg-blue-100",
    "solid+primary": "bg-amber-400 text-black hover:bg-amber-300",
    "outline+primary": "bg-transparent text-blue-500 hover:bg-blue-100",
  },
};

const Button: FunctionComponent<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    variant?: "solid" | "outline";
    intent?: "primary" | "danger";
  }
> = ({ variant = "solid", intent = "primary", ...rest }) => {
  return (
    <button
      className={classNames(
        cslxConfig.default,
        applyClsxConfig(cslxConfig, {
          variant: variant + "+" + intent,
        }),
      )}
      {...rest}
    />
  );
};

export default Button;
