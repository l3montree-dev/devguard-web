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
import Button from "../common/Button";

export function NodeInputSubmit<T>({
  node,
  attributes,
  disabled,
}: NodeInputProps) {
  return (
    <div className="mt-6 flex flex-row justify-end">
      <Button
        name={attributes.name}
        value={attributes.value || ""}
        disabled={attributes.disabled || disabled}
      >
        {getNodeLabel(node)}
      </Button>
    </div>
  );
}
