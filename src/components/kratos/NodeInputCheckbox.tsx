import { getNodeLabel } from "@ory/integrations/ui";
import { NodeInputProps } from "./helpers";
import { useId } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "@/components/ui/label";
import { useConfig } from "../../context/ConfigContext";

export function NodeInputCheckbox<T>({
  node,
  attributes,
  setValue,
  disabled,
}: NodeInputProps) {
  const id = useId();
  const themeConfig = useConfig();
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
        <Label htmlFor={id}>
          {getNodeLabel(node)}
          <a
            href={themeConfig.termsOfUseLink}
            target="_blank"
            rel="noreferrer nooperner"
          >
            terms-of-use
          </a>{" "}
          and{" "}
          <a
            href={themeConfig.privacyPolicyLink}
            target="_blank"
            className="whitespace-nowrap "
            rel="noreferrer nooperner"
          >
            privacy policy
          </a>
          .
        </Label>
      </div>
    );
}
