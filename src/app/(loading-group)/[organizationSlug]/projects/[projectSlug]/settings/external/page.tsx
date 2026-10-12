// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CopyInput from "@/components/common/CopyInput";
import Section from "@/components/common/Section";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/context/ConfigContext";
import { useProjectScope } from "@/hooks/useProjectScope";
import Link from "next/link";

const REFERENCE_URL =
  "https://github.com/l3montree-dev/devguard-k8s-image-inventory";

export default function ProjectExternalIntegrationsPage() {
  const config = useConfig();
  const { organization, projectSlug } = useProjectScope();

  return (
    <Section
      forceVertical
      primaryHeadline
      title="External integrations"
      description="DevGuard provides ingestion endpoints that allow external systems to push data while referencing entities using opaque, immutable identifiers managed by the external system."
    >
      <Label>SBOM Ingestion API</Label>
      <CopyInput
        value={`${config.devguardApiUrlPublicInternet}/api/v1/organizations/${organization}/projects/${projectSlug}/external/:provider-id`}
      />
      <small>
        Submit SBOMs for external entities while keeping your own identifier
        scheme. See <Link href={REFERENCE_URL}>{REFERENCE_URL}</Link> for a
        reference implementation.
      </small>
    </Section>
  );
}
