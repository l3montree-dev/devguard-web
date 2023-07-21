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
