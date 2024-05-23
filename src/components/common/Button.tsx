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
  default:
    "rounded-md px-3 shadow-sm flex flex-row items-center transition-all text-sm py-2 font-medium",
  variant: {
    "solid+danger": "bg-blue-500 text-white hover:bg-blue-600",
    "outline+danger":
      "bg-transparent text-red-500 border border-red-500 hover:bg-red-500/20",
    "solid+primary":
      "bg-yellow-400 text-black hover:bg-yellow-300 hover:text-black",
    "outline+primary":
      "bg-white text-black dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 shadow-sm border border-gray-300 hover:bg-gray-100",
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
    Icon?: JSX.Element;
  }
> = ({
  variant = "solid",
  intent = "primary",
  href,
  Icon,
  className,
  ...rest
}) => {
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
        {Boolean(Icon) && (
          <span className="mr-2 w-6 h-6 flex justify-center items-center">
            {Icon}
          </span>
        )}
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
    >
      {Boolean(Icon) && (
        <span className="mr-2 w-4 h-4 flex justify-center items-center">
          {Icon}
        </span>
      )}
      {rest.children}
    </button>
  );
};

export default Button;
