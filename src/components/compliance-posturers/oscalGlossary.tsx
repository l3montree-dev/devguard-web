// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Plain-language explanations of OSCAL terms, written for software
// developers rather than compliance professionals. Reused across the
// compliance-component UI (list view, detail view, attach dialog) so the
// wording stays consistent everywhere the concept shows up.

export const OSCAL_COMPONENT_EXPLANATION = (
  <>
    <p>
      A <strong>Component</strong>&nbsp;is a reusable building block for
      compliance - think of it like a feature, service, or piece of tooling
      (e.g. &ldquo;branch protection&rdquo;, &ldquo;dependency firewall&rdquo;)
      rather than a compliance document.
    </p>
    <p className="mt-2">
      Each component can claim to help satisfy one or more controls just by
      being enabled and configured correctly. This mirrors the{" "}
      <code>component-definition</code> concept in the{" "}
      <a
        href="https://pages.nist.gov/OSCAL/"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        OSCAL
      </a>{" "}
      spec (NIST&apos;s machine-readable compliance format): a component
      published once, describing which controls it helps with and how - so it
      can be reused across every system that uses it.
    </p>
  </>
);
