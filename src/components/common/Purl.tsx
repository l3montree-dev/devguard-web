import {
  beautifyPurl,
  extractPurlQualifiers,
  extractVersion,
  formatPurlQualifiers,
} from "@/utils/common";
import { useState, type FunctionComponent, type MouseEvent } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/lib/toast";
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
  const [copied, setCopied] = useState(false);
  const qualifiers = showQualifiers ? extractPurlQualifiers(purl) : "";
  const secondaryClassName =
    variant === "compact" ? "font-medium" : "text-xs text-muted-foreground";

  const handleCopy = (e: MouseEvent) => {
    //to prevent opening package behind the copy button
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(purl);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex min-w-0 items-center gap-1.5 ${className ?? ""}`}
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
      <TooltipContent className="max-w-sm font-mono">
        <span className="flex items-start gap-1.5">
          <span className="break-all">{purl}</span>
          <button
            onClick={handleCopy}
            type="button"
            aria-label="copy purl to clipboard"
            className="-my-0.25 -mr-1 rounded-md shrink-0 p-1 transition-all hover:bg-foreground/10"
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

export default Purl;
