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
import { UiNodeGroupEnum } from "@ory/client";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import DateString from "../common/DateString";
import { Button } from "../ui/button";

export function NodeInputSubmit<T>({
  node,
  attributes,
  disabled,
}: NodeInputProps) {
  if (node.group === UiNodeGroupEnum.Webauthn) {
    if ((node.attributes as any).name === "webauthn_remove") {
      return (
        <div className="mb-6 overflow-hidden rounded-md border bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <span className="text-base font-semibold">
                {(node.meta.label?.context as any)?.display_name}
              </span>
              <br />

              <span className="text-sm text-gray-400">
                Created at:{" "}
                <DateString
                  date={
                    new Date(
                      (node.meta.label?.context as any).added_at_unix * 1000,
                    )
                  }
                />
              </span>
            </div>

            <Button variant="destructive" className="whitespace-nowrap">
              Delete
            </Button>
          </div>
        </div>
      );
    }
    // render the webauthn node
    return (
      <div className="mt-6 flex flex-row justify-end">
        <Button
          className="capitalize"
          name={attributes.name}
          value={attributes.value || ""}
          disabled={attributes.disabled || disabled}
        >
          <FingerPrintIcon className="mr-2 h-4 w-4" />
          {getNodeLabel(node)}
        </Button>
      </div>
    );
  }

  if ((node.meta.label?.context as any)?.provider === "github") {
    // render the github node
    return (
      <div className="flex flex-row justify-end">
        <Button
          className="capitalize"
          name={attributes.name}
          value={attributes.value || ""}
          disabled={attributes.disabled || disabled}
        >
          <Image
            src="/assets/github.svg"
            alt="GitHub Logo"
            className="mr-2 invert dark:invert-0"
            width={20}
            height={20}
          />
          {getNodeLabel(node)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-end">
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
