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

import { callWebauthnFunction, NodeInputProps } from "./helpers";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

export function NodeInputButton<T>({
  node,
  attributes,
  setValue,
  disabled,
  dispatchSubmit,
}: NodeInputProps) {
  // Some attributes have dynamic JavaScript - this is for example required for WebAuthn.
  const onClick = (e: React.MouseEvent | React.FormEvent<HTMLFormElement>) => {
    // This section is only used for WebAuthn. The script is loaded via a <script> node
    // and the functions are available on the global window level. Unfortunately, there
    // is currently no better way than executing eval / function here at this moment.
    //
    // Please note that we also need to prevent the default action from happening.
    if (attributes.onclick) {
      e.stopPropagation();
      e.preventDefault();
      callWebauthnFunction(attributes.onclick);
      return;
    }

    setValue(attributes.value).then(() => dispatchSubmit(e));
  };

  if (node.meta.label?.text === "Add passkey") {
    return (
      <div className="flex flex-row justify-end">
        <Button
          name={attributes.name}
          onClick={(e) => {
            onClick(e);
          }}
          variant={"secondary"}
          value={attributes.value || ""}
          disabled={attributes.disabled || disabled}
        >
          <FingerPrintIcon
            className="mr-2 h-4 w-4 shrink-0"
            aria-hidden="true"
          />

          {getNodeLabel(node)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-end">
      <Button
        name={attributes.name}
        onClick={(e) => {
          onClick(e);
        }}
        variant={"secondary"}
        value={attributes.value || ""}
        disabled={attributes.disabled || disabled}
      >
        {attributes.name === "passkey_login_trigger" && (
          <FingerPrintIcon
            className="mr-2 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
        )}
        {getNodeLabel(node)}
      </Button>
    </div>
  );
}
