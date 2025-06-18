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

  // Render only if it's the confirmedTerms checkbox and value is true, this looks weird because in the registration the key "value" is not actually given
  if (
    attributes.name === "traits.confirmedTerms" &&
    attributes.value === true
  ) {
    null;
  } else
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={attributes.value}
          onCheckedChange={(checked) => setValue(!!checked)}
          disabled={attributes.disabled || disabled}
          name={attributes.name}
        />
        <Label htmlFor={id}>
          {getNodeLabel(node)}
          <a href="https://devguard.org/terms-of-use">
            devguard.org/terms-of-use
          </a>
        </Label>
      </div>
    );
}
