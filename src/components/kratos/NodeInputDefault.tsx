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

import { FormDescription, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NodeInputProps } from "./helpers";

export function NodeInputDefault<T>(props: NodeInputProps) {
  const { node, attributes, value = "", setValue, disabled } = props;

  // Some attributes have dynamic JavaScript - this is for example required for WebAuthn.
  const onClick = () => {
    // This section is only used for WebAuthn. The script is loaded via a <script> node
    // and the functions are available on the global window level. Unfortunately, there
    // is currently no better way than executing eval / function here at this moment.
    if (attributes.onclick) {
      const run = new Function(attributes.onclick);
      run();
    }
  };

  const labelText =
    node.meta.label?.text === "ID" ? "E-Mail" : node.meta.label?.text;

  // Render a generic text input field.
  return (
    <div className="mb-4 grid w-full items-center gap-1.5">
      <Label>{labelText ?? ""}</Label>
      <Input
        type={attributes.type}
        name={attributes.name}
        value={value}
        disabled={attributes.disabled || disabled}
        onClick={onClick}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />

      <>
        {node.messages.map(({ text, id }, k) => (
          <span
            key={`${id}-${k}`}
            className="mt-2 block text-sm text-red-500"
            data-testid={`ui/message/${id}`}
          >
            {text}
          </span>
        ))}
      </>
    </div>
  );
}
