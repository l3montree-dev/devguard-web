// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { getNodeLabel } from "@ory/integrations/ui";

import { NodeInputProps } from "./helpers";
import { useId } from "react";

export function NodeInputCheckbox<T>({
  node,
  attributes,
  setValue,
  disabled,
}: NodeInputProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{getNodeLabel(node)}</label>
      <input
        type="checkbox"
        id={id}
        name={attributes.name}
        defaultChecked={attributes.value}
        onChange={(e) => setValue(e.target.checked)}
        disabled={attributes.disabled || disabled}
      />
    </>
  );
}
