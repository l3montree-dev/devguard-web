// Copyright (C) 2026 l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

export const OSCAL_ATTACH_COMPONENT_EXPLANATION = (
  <>
    <p>
      &ldquo;Attaching&rdquo; a component here records that{" "}
      <strong>your system</strong>&nbsp;actually uses it to help satisfy this
      control - and at what status.
    </p>
    <p className="mt-2">
      In OSCAL terms, this creates a <code>by-component</code> entry under the
      control&apos;s <code>implemented-requirement</code>. A control can have
      several of these: DevGuard always tracks its own direct assessment, and
      you can add more for any real component (branch protection, a signing
      tool, etc.) you rely on.
    </p>
  </>
);

export const OSCAL_IMPLEMENTATION_STATUS_EXPLANATION = (
  <>
    <p>
      How far along <strong>this component</strong> is in actually satisfying
      the control for your system right now (OSCAL&apos;s{" "}
      <code>implementation-status</code> field):
    </p>
    <ul className="mt-2 list-disc pl-4">
      <li>
        <strong>Implemented</strong> - fully enabled/configured.
      </li>
      <li>
        <strong>Partial</strong> - enabled, but not covering the full control.
      </li>
      <li>
        <strong>Planned</strong> - not enabled yet, but on the roadmap.
      </li>
      <li>
        <strong>Alternative</strong> - satisfies the control a different way
        than the component&apos;s own description suggests.
      </li>
      <li>
        <strong>Not Applicable</strong> - doesn&apos;t apply to your setup.
      </li>
    </ul>
  </>
);

export const OSCAL_CATALOG_CLAIM_EXPLANATION = (
  <>
    A component&apos;s own claim (from its OSCAL{" "}
    <code>component-definition</code>) that it helps implement this control -
    written by whoever published the component, before you&apos;ve said anything
    about how you&apos;re actually using it.
  </>
);
