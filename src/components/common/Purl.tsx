import {
  beautifyPurl,
  extractPurlQualifiers,
  extractVersion,
  formatPurlQualifiers,
} from "@/utils/common";
import type { FunctionComponent } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EcosystemImage from "./EcosystemImage";

interface PurlProps {
  purl: string;
  /** "compact" renders version/qualifiers at the same size as the package name. "plain" (default) renders them smaller and muted. */
  variant?: "plain" | "compact";
  showIcon?: boolean;
  showVersion?: boolean;
  showQualifiers?: boolean;
  className?: string;
}

/** Renders a package purl consistently across the app - see beautifyPurl/purlToDisplayString for the underlying formatting. */
const Purl: FunctionComponent<PurlProps> = ({
  purl,
  variant = "plain",
  showIcon = true,
  showVersion = true,
  showQualifiers = true,
  className,
}) => {
  const qualifiers = showQualifiers ? extractPurlQualifiers(purl) : "";
  const secondaryClassName =
    variant === "compact" ? "font-medium" : "text-xs text-muted-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`flex w-full min-w-0 items-center gap-1.5 ${className ?? ""}`}
        >
          {showIcon && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <EcosystemImage packageName={purl} size={16} />
            </span>
          )}
          <span className="shrink-0 truncate font-medium">
            {beautifyPurl(purl)}
          </span>
          {showVersion && extractVersion(purl) && (
            <span
              className={`min-w-0 flex-1 truncate whitespace-nowrap ${secondaryClassName}`}
            >
              {extractVersion(purl)}
            </span>
          )}
          {qualifiers && (
            <span
              className={`max-w-64 shrink-0 truncate whitespace-nowrap ${secondaryClassName}`}
            >
              {formatPurlQualifiers(purl)}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm break-all font-mono">
        {purl}
      </TooltipContent>
    </Tooltip>
  );
};

export default Purl;
