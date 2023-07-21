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

import { UiNode, UiNodeTextAttributes, UiText } from "@ory/client";

interface Props {
  node: UiNode;
  attributes: UiNodeTextAttributes;
}

const Content = ({ node, attributes }: Props) => {
  switch (attributes.text.id) {
    case 1050015:
      // This text node contains lookup secrets. Let's make them a bit more beautiful!
      const secrets = (attributes.text.context as any).secrets.map(
        (text: UiText, k: number) => (
          <div
            key={k}
            data-testid={`node/text/${attributes.id}/lookup_secret`}
            className="col-xs-3"
          >
            {/* Used lookup_secret has ID 1050014 */}
            <code>{text.id === 1050014 ? "Used" : text.text}</code>
          </div>
        ),
      );
      return (
        <div
          className="container-fluid"
          data-testid={`node/text/${attributes.id}/text`}
        >
          <div className="row">{secrets}</div>
        </div>
      );
  }

  return (
    <div
      className="mt-2 font-medium text-white"
      data-testid={`node/text/${attributes.id}/text`}
    >
      {attributes.text.text}
    </div>
  );
};

export const NodeText = ({ node, attributes }: Props) => {
  return (
    <>
      <p
        className="mt-6 text-sm text-white"
        data-testid={`node/text/${attributes.id}/label`}
      >
        {node.meta?.label?.text}
      </p>
      <Content node={node} attributes={attributes} />
    </>
  );
};
