// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ConfigFileEditor from "@/components/common/ConfigFileEditor";
import Page from "@/components/Page";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";

const Config = () => {
  const org = useActiveOrg();
  const orgMenu = useOrganizationMenu();

  const baseUrl = org ? "/organizations/" + org.slug : null;

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <ConfigFileEditor baseUrl={baseUrl} />
    </Page>
  );
};

export default Config;
