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

import { NodeInputButton } from "./NodeInputButton";
import { NodeInputCheckbox } from "./NodeInputCheckbox";
import { NodeInputDefault } from "./NodeInputDefault";
import { NodeInputHidden } from "./NodeInputHidden";
import { NodeInputSubmit } from "./NodeInputSubmit";
import { NodeInputProps } from "./helpers";

export function NodeInput<T>(props: NodeInputProps) {
  const { attributes } = props;

  switch (attributes.type) {
    case "hidden":
      // Render a hidden input field
      return <NodeInputHidden {...props} />;
    case "checkbox":
      // Render a checkbox. We have one hidden element which is the real value (true/false), and one
      // display element which is the toggle value (true)!
      return <NodeInputCheckbox {...props} />;
    case "button":
      // Render a button
      return <NodeInputButton {...props} />;
    case "submit":
      // Render the submit button
      return <NodeInputSubmit {...props} />;
  }

  // Render a generic text input field.
  return <NodeInputDefault {...props} />;
}
