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

import { UiNode, UiNodeImageAttributes } from "@ory/client";

interface Props {
  node: UiNode;
  attributes: UiNodeImageAttributes;
}

export const NodeImage = ({ node, attributes }: Props) => {
  return (
    <img
      data-testid={`node/image/${attributes.id}`}
      src={attributes.src}
      alt={node.meta.label?.text}
      className="h-56"
    />
  );
};
