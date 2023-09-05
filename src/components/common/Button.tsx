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

const Button: FunctionComponent<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    variant?: "solid" | "outline";
    intent?: "primary" | "danger";
  }
> = (props) => {
  const classNames = (options: {
    intent?: "primary" | "danger";
    variant?: "solid" | "outline";
  }) => {
    let cls =
      "rounded-sm whitespace-nowrap px-3 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

    if (options.variant === "outline") {
      if (options.intent === "danger") {
        cls += ` border border-red-500 text-red-500 hover:bg-red-500 hover:text-white`;
      } else {
        cls += ` border border-amber-400 text-amber-400 hover:bg-amber-200 hover:text-slate-900`;
      }
    } else {
      if (options.intent === "danger") {
        cls += ` bg-red-500 text-white hover:bg-red-600`;
      } else {
        cls += ` bg-amber-400 text-slate-900 hover:bg-amber-200`;
      }
    }
    return cls;
  };

  return <button className={classNames(props)} {...props} />;
};

export default Button;
