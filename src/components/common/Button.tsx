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
import Link from "next/link";

const cslxConfig = {
  default: "rounded-sm px-2 transition-all text-sm py-2 font-medium",
  variant: {
    "solid+danger": "bg-blue-500 text-white hover:bg-blue-600",
    "outline+danger":
      "bg-transparent text-red-500 border border-red-500 hover:bg-red-100",
    "solid+primary": "bg-amber-400 text-black hover:bg-amber-300",
    "outline+primary":
      "bg-transparent text-amber-600 border border-amber-400 hover:bg-amber-200",
    "outline+secondary":
      "bg-transparent text-blue-600 hover:bg-blue-100 border border-blue-500",
  },
};

const Button: FunctionComponent<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    variant?: "solid" | "outline";
    intent?: "primary" | "danger" | "secondary";
    href?: string;
  }
> = ({ variant = "solid", intent = "primary", href, className, ...rest }) => {
  if (href) {
    return (
      <Link
        href={href}
        className={classNames(
          cslxConfig.default,
          applyClsxConfig(cslxConfig, {
            variant: variant + "+" + intent,
          }),
          "hover:no-underline",
          className,
        )}
      >
        {rest.children}
      </Link>
    );
  }
  return (
    <button
      className={classNames(
        cslxConfig.default,
        applyClsxConfig(cslxConfig, {
          variant: variant + "+" + intent,
        }),
        rest.disabled ? "opacity-75 cursor-not-allowed" : "",
        className,
      )}
      {...rest}
    />
  );
};

export default Button;
