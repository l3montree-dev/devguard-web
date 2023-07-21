// Copyright 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
