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

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NodeInputProps } from "./helpers";
import { Button } from "../ui/button";
import { LucideEye, LucideEyeOff } from "lucide-react";
import Callout from "../common/Callout";

export function NodeInputDefault<T>(props: NodeInputProps) {
  const { node, attributes, value = "", setValue, disabled } = props;
  const [inputType, setInputType] = useState<string>(attributes.type);

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
    <div className="relative grid w-full items-center gap-3">
      <Label>{labelText ?? ""}</Label>
      <div className="relative ">
        <Input
          className="flex"
          type={inputType}
          name={attributes.name}
          value={value}
          disabled={attributes.disabled || disabled}
          onClick={onClick}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          variant="onCard"
        />

        {attributes.type && attributes.type === "password" && (
          <div>
            <div className="absolute right-0 bottom-0  mt-2 scale-75 ">
              {inputType === "password" ? (
                <Button
                  variant="secondary"
                  onClick={() => setInputType("text")}
                  size={"icon"}
                  type="button"
                >
                  <LucideEyeOff />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size={"icon"}
                  onClick={() => setInputType("password")}
                >
                  <LucideEye />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <>
        {node.messages.map(({ text, id }, k) => (
          <Callout intent="warning" key={`${id}-${k}`}>
            <span data-testid={`ui/message/${id}`}>{text}</span>
          </Callout>
        ))}
      </>
    </div>
  );
}
