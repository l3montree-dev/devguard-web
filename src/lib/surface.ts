// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

// the surface a component is rendered on - the page/ dialog background or a card.
// Components which are rendered on both take it as a "variant" prop.
export type Surface = "default" | "onCard";

// cards inside a component need to stand out from the surface the component is rendered on
export const innerCardClassName = (variant: Surface = "default") =>
  variant === "onCard" ? "bg-background" : "bg-card";

// inputs inside such an inner card sit on the opposite surface
export const innerInputVariant = (variant: Surface = "default"): Surface =>
  variant === "onCard" ? "default" : "onCard";
