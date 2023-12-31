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

type Props = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  label: string;
};

const Select = React.forwardRef<any, Props>((props, ref) => {
  const { label, ...rest } = props;
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium leading-6">
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        className="block border mt-2 w-full border-gray-300 shadow-sm rounded-md bg-white py-1.5 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-400 sm:text-sm sm:leading-6 [&_*]:text-black"
        {...rest}
      />
    </>
  );
});

Select.displayName = "Select";

export default Select;
