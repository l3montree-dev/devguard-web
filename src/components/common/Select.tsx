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
  containerClassName?: string;
};

const Select = React.forwardRef<any, Props>((props, ref) => {
  const { label, containerClassName, ...rest } = props;
  const id = useId();
  return (
    <div className={containerClassName}>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6 dark:text-white"
      >
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        className="mt-2 block w-full rounded-md border-gray-300 bg-white py-2 shadow-sm ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:leading-6 [&_*]:text-black"
        {...rest}
      />
    </div>
  );
});

Select.displayName = "Select";

export default Select;
