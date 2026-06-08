"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { CSS_VARS_CHANGED } from "@/components/themes/CSSVariableEditor";

function isLightColor(cssVariable: string) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVariable)
    .trim();

  // Handles both "h s% l%" (space-separated) and "h, s%, l%" (comma-separated)
  const match = color.match(/[\d.]+[\s,]+[\d.]+%[\s,]+([\d.]+)%/);
  if (!match) return null;

  return parseFloat(match[1]) > 50;
}

const EntityProviderImage = ({ provider }: { provider: string }) => {
  const [isLightForegroundColor, setLightForegroundColor] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    function update() {
      const isLight = isLightColor("--header-background");
      if (isLight !== null) setLightForegroundColor(isLight);
    }

    update();

    window.addEventListener(CSS_VARS_CHANGED, update);
    return () => window.removeEventListener(CSS_VARS_CHANGED, update);
  }, [resolvedTheme]);

  if (provider === "@gitlab") {
    return (
      <Image
        src="/assets/gitlab.svg"
        alt="Official Logo"
        width={30}
        height={30}
      />
    );
  } else if (provider === "@opencode") {
    return (
      <Image
        src="/logos/opencode.svg"
        alt="OpenCode Logo"
        width={30}
        height={30}
        className="relative right-[1px]"
      />
    );
  }
  // check foreground color - if light, use inverse logo, else use normal logo

  if (isLightForegroundColor) {
    return (
      <Image
        src="/logo_icon.svg"
        alt="DevGuard Logo"
        width={30}
        height={30}
        className="relative right-[1px]"
      />
    );
  }

  return (
    <Image
      src="/logo_inverse_icon.svg"
      alt="DevGuard Logo"
      width={30}
      height={30}
    />
  );
};

export default EntityProviderImage;
