// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePostureDetailView from "@/components/compliance-posturers/CompliancePostureDetailView";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, vulnId } = useDecodedParams() as {
    organizationSlug: string;
    vulnId: string;
  };

  const scope = {
    level: "organization",
    organization: organizationSlug,
  } as const;

  return <CompliancePostureDetailView scope={scope} vulnId={vulnId} />;
};

export default Index;
