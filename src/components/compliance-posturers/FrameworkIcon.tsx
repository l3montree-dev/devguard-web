"use client";

import { classNames } from "@/utils/common";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { FunctionComponent } from "react";

// Explicit framework → logo mapping. Keys must match the backend's framework
// names exactly. Frameworks without a logo (or whose file fails to load) fall
// back to a neutral shield icon, so a missing/renamed asset never shows a
// broken image.
const FRAMEWORK_LOGOS: Record<string, string> = {
  "OpenSSF Scorecard": "/assets/compliance-icons/openssf_scorecard.webp",
  "L3montree Compliance": "/assets/compliance-icons/l3montree_compliance.webp",
  "ISO 27001": "/assets/iso.svg",
  "Best Practices": "/logo_icon.svg",
};

interface Props {
  framework: string;
  className?: string;
}

const FrameworkIcon: FunctionComponent<Props> = ({ framework, className }) => {
  const src = FRAMEWORK_LOGOS[framework];
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <ShieldCheck
        className={classNames(
          "h-4 w-4 shrink-0 text-muted-foreground",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      className={classNames("h-4 w-4 shrink-0 object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
};

export default FrameworkIcon;
