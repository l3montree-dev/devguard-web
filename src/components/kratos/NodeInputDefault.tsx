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

import { NodeInputProps } from "./helpers";

export function NodeInputDefault<T>(props: NodeInputProps) {
  const { node, attributes, value = "", setValue, disabled } = props;

  // Some attributes have dynamic JavaScript - this is for example required for WebAuthn.
  const onClick = () => {
    // This section is only used for WebAuthn. The script is loaded via a <script> node
    // and the functions are available on the global window level. Unfortunately, there
    // is currently no better way than executing eval / function here at this moment.
    if (attributes.onclick) {
      const run = new Function(attributes.onclick);
      run();
    }
  };

  // Render a generic text input field.
  return (
    <>
      {node.meta.label?.text && (
        <label
          className="mt-6 block text-sm font-medium leading-6 text-white"
          htmlFor={attributes.name}
        >
          {node.meta.label?.text}
        </label>
      )}
      <input
        title={node.meta.label?.text}
        onClick={onClick}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        type={attributes.type}
        name={attributes.name}
        value={value}
        disabled={attributes.disabled || disabled}
        className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 px-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
      />
      <>
        {node.messages.map(({ text, id }, k) => (
          <span key={`${id}-${k}`} data-testid={`ui/message/${id}`}>
            {text}
          </span>
        ))}
      </>
    </>
  );
}
