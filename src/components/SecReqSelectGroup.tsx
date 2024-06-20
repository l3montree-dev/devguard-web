// Copyright (C) 2024 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { classNames } from "@/utils/common";

const options = [{ name: "Low" }, { name: "Medium" }, { name: "High" }];

interface Props {
  label: string;
}

export default function SecReqSelectGroup(props: Props) {
  const [option, setOption] = useState(options[1]);

  return (
    <fieldset aria-label="Choose a memory option">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
          {props.label}
        </div>
      </div>

      <RadioGroup
        value={option}
        onChange={setOption}
        className="mt-2 grid grid-cols-3 gap-3"
      >
        {options.map((option) => (
          <Radio
            key={option.name}
            value={option}
            className={({ focus, checked }) =>
              classNames(
                focus ? "ring-2 ring-yellow-400 ring-offset-2" : "",
                checked
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-gray-400 text-gray-900 hover:bg-gray-300",
                " flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-sm font-semibold focus:outline-none sm:flex-1",
              )
            }
          >
            {option.name}
          </Radio>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
