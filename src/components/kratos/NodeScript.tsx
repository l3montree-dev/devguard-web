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

import { UiNode, UiNodeScriptAttributes } from "@ory/client";
import { HTMLAttributeReferrerPolicy, useEffect } from "react";

interface Props {
  node: UiNode;
  attributes: UiNodeScriptAttributes;
}

export const NodeScript = ({ attributes }: Props) => {
  useEffect(() => {
    const script = document.createElement("script");

    script.async = true;
    script.setAttribute("data-testid", `node/script/${attributes.id}`);
    script.src = attributes.src;
    script.async = attributes.async;
    script.crossOrigin = attributes.crossorigin;
    script.integrity = attributes.integrity;
    script.referrerPolicy =
      attributes.referrerpolicy as HTMLAttributeReferrerPolicy;
    script.type = attributes.type;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [attributes]);

  return null;
};
