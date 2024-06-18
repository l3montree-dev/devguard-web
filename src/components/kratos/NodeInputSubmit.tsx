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
import { UiNodeGroupEnum } from "@ory/client";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export function NodeInputSubmit<T>({
  node,
  attributes,
  disabled,
}: NodeInputProps) {
  if (node.group === UiNodeGroupEnum.Webauthn) {
    // render the webauthn node
    return (
      <div className="mt-6 flex flex-row justify-end">
        <Button
          Icon={<FingerPrintIcon />}
          className="capitalize"
          name={attributes.name}
          value={attributes.value || ""}
          disabled={attributes.disabled || disabled}
        >
          {getNodeLabel(node)}
        </Button>
      </div>
    );
  }

  if ((node.meta.label?.context as any)?.provider === "github") {
    // render the github node
    return (
      <div className="mt-6 flex flex-row justify-end">
        <Button
          className="capitalize"
          name={attributes.name}
          Icon={
            <Image
              src="/assets/github.svg"
              alt="GitHub Logo"
              className="invert dark:invert-0"
              width={24}
              height={24}
            />
          }
          variant="solid"
          intent="secondary"
          value={attributes.value || ""}
          disabled={attributes.disabled || disabled}
        >
          {getNodeLabel(node)}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-row justify-end">
      <Button
        className="capitalize"
        name={attributes.name}
        value={attributes.value || ""}
        disabled={attributes.disabled || disabled}
      >
        {getNodeLabel(node)}
      </Button>
    </div>
  );
}
