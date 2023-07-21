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
