import { PropsWithChildren } from "react";
import { Label } from "@/components/ui/label";
import { useConfig } from "../../context/ConfigContext";

type TermsConsentProps = PropsWithChildren<{
  htmlFor?: string;
  className?: string;
}>;

export function TermsConsent({
  htmlFor,
  className,
  children,
}: TermsConsentProps) {
  const themeConfig = useConfig();

  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      {children ? " " : null}
      <a
        href={themeConfig.termsOfUseLink}
        target="_blank"
        rel="noreferrer nooperner"
      >
        terms of use
      </a>{" "}
      and{" "}
      <a
        href={themeConfig.privacyPolicyLink}
        target="_blank"
        className="whitespace-nowrap"
        rel="noreferrer nooperner"
      >
        privacy policy
      </a>
      .
    </Label>
  );
}
