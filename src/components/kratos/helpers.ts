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

import { UiNode, UiNodeInputAttributes, UiText } from "@ory/client";
import { FormEvent, MouseEvent, useEffect } from "react";

export type ValueSetter = (
  value: string | number | boolean | undefined,
) => Promise<void>;

export type FormDispatcher = (
  e: FormEvent<HTMLFormElement> | MouseEvent,
) => Promise<void>;

export interface NodeInputProps {
  node: UiNode;
  attributes: UiNodeInputAttributes;
  value: any;
  disabled: boolean;
  dispatchSubmit: FormDispatcher;
  setValue: ValueSetter;
}

export const useOnload = (attributes: { onload?: string }) => {
  useEffect(() => {
    if (attributes.onload) {
      /*const intervalHandle = callWebauthnFunction(attributes.onload);

      return () => {
        window.clearInterval(intervalHandle);
      };*/
    }
  }, [attributes]);
};

export const callWebauthnFunction = (functionBody: string) => {
  const run = new Function(functionBody);

  const intervalHandle = window.setInterval(() => {
    if ((window as any).__oryWebAuthnInitialized) {
      run();
      window.clearInterval(intervalHandle);
    }
  }, 100);

  return intervalHandle;
};

export const kratosMessageTypeToIntent = (
  messages?: UiText[],
): "info" | "success" | "danger" => {
  // If there are no messages, its info
  if (!messages) {
    return "info";
  }

  // If there are messages, we need to find the most severe one
  return messages.reduce<"info" | "success" | "danger">((acc, message) => {
    if (message.type === "error") {
      return "danger";
    }
    if (message.type === "success") {
      return "success";
    }
    return acc;
  }, "info");
};
