// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Middleware } from "@ory/client-fetch";
import type { AltchaWidgetElement } from "altcha";
import { isAltchaProtected } from "@/utils/altcha";

const SETTLED_STATES = new Set(["verified", "error"]);

const whenSettled = (widget: AltchaWidgetElement) =>
  new Promise<void>((resolve) => {
    if (widget.getState() === "verified") {
      resolve();
      return;
    }
    const onStateChange = (event: Event) => {
      if (
        SETTLED_STATES.has(
          (event as CustomEvent<{ state: string }>).detail.state,
        )
      ) {
        widget.removeEventListener("statechange", onStateChange);
        resolve();
      }
    };
    widget.addEventListener("statechange", onStateChange);
    if (widget.getState() !== "verifying") {
      void widget.verify();
    }
  });

export const altchaOryMiddleware: Middleware = {
  pre: async ({ url, init }) => {
    const widget = document.querySelector("altcha-widget");
    if (!widget || !isAltchaProtected(init.method, new URL(url).pathname)) {
      return;
    }
    await customElements.whenDefined("altcha-widget");
    await whenSettled(widget);
  },
};
