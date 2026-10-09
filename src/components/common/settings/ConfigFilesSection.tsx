// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ConfigFileEditor from "@/components/common/ConfigFileEditor";
import Section from "@/components/common/Section";
import type { ConfigScope } from "@/services/configFileService";

const ConfigFilesSection = ({
  scope,
  description,
}: {
  scope: ConfigScope;
  description: string;
}) => (
  <Section
    forceVertical
    primaryHeadline
    title="Configuration files"
    description={description}
  >
    <ConfigFileEditor scope={scope} />
  </Section>
);

export default ConfigFilesSection;
