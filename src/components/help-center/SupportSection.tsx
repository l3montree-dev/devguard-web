// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Section from "@/components/common/Section";
import HelpCenterItem from "@/components/help-center/HelpCenterItem";
import {
  CircleDotIcon,
  LifeBuoyIcon,
  MessageSquareIcon,
  UsersIcon,
} from "lucide-react";
import type { FunctionComponent } from "react";

const SupportSection: FunctionComponent = () => (
  <Section
    title="Get in Touch"
    description="Can't find what you're looking for? We're here to help."
    forceVertical
  >
    <HelpCenterItem
      Icon={LifeBuoyIcon}
      title="Enterprise Support"
      description="Get direct help from the DevGuard team. Available for Enterprise and Pro customers."
      actionLabel="Contact Support"
      href="https://devguard.org"
      variant="default"
    />
    <HelpCenterItem
      Icon={UsersIcon}
      title="Join the Community"
      description="Chat with other DevGuard users and the core team on Matrix."
      actionLabel="Open Matrix"
      href="https://matrix.to/#/#devguard:matrix.org"
      external
    />
    <HelpCenterItem
      Icon={MessageSquareIcon}
      title="GitHub Discussions"
      description="Ask questions, share ideas, and get community feedback on GitHub Discussions."
      actionLabel="Open Discussions"
      href="https://github.com/l3montree-dev/devguard/discussions"
      external
    />
    <HelpCenterItem
      Icon={CircleDotIcon}
      title="GitHub Issues"
      description="Found a bug or want to request a feature? Open an issue on GitHub."
      actionLabel="Open Issues"
      href="https://github.com/l3montree-dev/devguard/issues"
      external
    />
  </Section>
);

export default SupportSection;
