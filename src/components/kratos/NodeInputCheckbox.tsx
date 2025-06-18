import { getNodeLabel } from "@ory/integrations/ui";
import { NodeInputProps } from "./helpers";
import { useId } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "@/components/ui/label";

export function NodeInputCheckbox<T>({
  node,
  attributes,
  setValue,
  disabled,
}: NodeInputProps) {
  const id = useId();

  // Render only if it's the confirmedTerms checkbox and disabled is true
  if (
    attributes.name === "traits.confirmedTerms" &&
    attributes.value === false
  ) {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={attributes.value}
          onCheckedChange={(checked) => setValue(!!checked)}
          disabled={attributes.disabled || disabled}
          name={attributes.name}
        />
        <Label htmlFor={id}>{getNodeLabel(node)}</Label>
      </div>
    );
  }

  return null;
}
