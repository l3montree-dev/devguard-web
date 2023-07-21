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

import { UiNode } from "@ory/client";
import {
  isUiNodeAnchorAttributes,
  isUiNodeImageAttributes,
  isUiNodeInputAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
} from "@ory/integrations/ui";

import { NodeAnchor } from "./NodeAnchor";
import { NodeImage } from "./NodeImage";
import { NodeInput } from "./NodeInput";
import { NodeScript } from "./NodeScript";
import { NodeText } from "./NodeText";
import { FormDispatcher, ValueSetter } from "./helpers";

interface Props {
  node: UiNode;
  disabled: boolean;
  value: any;
  setValue: ValueSetter;
  dispatchSubmit: FormDispatcher;
}

export const Node = ({
  node,
  value,
  setValue,
  disabled,
  dispatchSubmit,
}: Props) => {
  if (isUiNodeImageAttributes(node.attributes)) {
    return <NodeImage node={node} attributes={node.attributes} />;
  }

  if (isUiNodeScriptAttributes(node.attributes)) {
    return <NodeScript node={node} attributes={node.attributes} />;
  }

  if (isUiNodeTextAttributes(node.attributes)) {
    return <NodeText node={node} attributes={node.attributes} />;
  }

  if (isUiNodeAnchorAttributes(node.attributes)) {
    return <NodeAnchor node={node} attributes={node.attributes} />;
  }

  if (isUiNodeInputAttributes(node.attributes)) {
    return (
      <NodeInput
        dispatchSubmit={dispatchSubmit}
        value={value}
        setValue={setValue}
        node={node}
        disabled={disabled}
        attributes={node.attributes}
      />
    );
  }

  return null;
};
