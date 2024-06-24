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
          className="container-fluid mt-4 rounded-sm bg-white p-2 text-sm dark:bg-slate-800"
          data-testid={`node/text/${attributes.id}/text`}
        >
          <div className="row">{secrets}</div>
        </div>
      );
  }

  return (
    <div
      className="mt-2 font-medium"
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
        className="mt-6 text-sm"
        data-testid={`node/text/${attributes.id}/label`}
      >
        {node.meta?.label?.text}
      </p>
      <Content node={node} attributes={attributes} />
    </>
  );
};
