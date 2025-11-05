import { getNodeLabel } from "@ory/integrations/ui";
import { NodeInputProps } from "./helpers";
import { useId } from "react";
import { Checkbox } from "../ui/checkbox";
import { TermsConsent } from "./TermsConsent";

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
    return null;
  } else
    return (
      <div className="flex flex-row gap-2 items-start">
        <Checkbox
          id={id}
          checked={attributes.value}
          onCheckedChange={(checked) => setValue(!!checked)}
          disabled={attributes.disabled || disabled}
          name={attributes.name}
          required={attributes.required}
        />
        <TermsConsent htmlFor={id}>{getNodeLabel(node)}</TermsConsent>
      </div>
    );
}
