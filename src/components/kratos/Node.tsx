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
