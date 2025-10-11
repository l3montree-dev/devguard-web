"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

function isLightColor(cssVariable: string) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVariable)
    .trim();

  // Parse HSL format: "0 0% 0%" or "hsl(0, 0%, 0%)"
  const hslMatch = color.match(/(\d+),\s(\d+)%,\s(\d+)%/);

  if (!hslMatch) return null;

  const lightness = parseFloat(hslMatch[3]);

  // Lightness > 50% is generally considered light
  return lightness > 50;
}

const EntityProviderImage = ({ provider }: { provider: string }) => {
  const [isLightForegroundColor, setLightForegroundColor] = useState(false);
  const theme = useTheme();
  useEffect(() => {
    const isLight = isLightColor("--header-background");
    if (isLight !== null) {
      setLightForegroundColor(isLight);
    }
    // test again after 1 second - to catch late theme changes
    setTimeout(() => {
      const isLight = isLightColor("--header-background");
      if (isLight !== null) {
        setLightForegroundColor(isLight);
      }
    }, 1000);
  }, [theme]);

  console.log(provider);
  if (provider === "@official") {
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
