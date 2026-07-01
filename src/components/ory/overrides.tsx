// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryFlowComponentOverrides } from "@ory/elements-react";

import { OryAuthMethodListItem } from "./flowcomponents/AuthMethod";
import {
  OryCardDivider,
  OryCardFooter,
  OryCardHeader,
  OryCardRoot,
  OryCardRootTransparent,
  OrySettingsSection,
  OrySettingsSectionContent,
  OrySettingsSectionFooter,
} from "./flowcomponents/Cards";
import { OryMessageContent, OryToast } from "./flowcomponents/Messages";
import {
  OryButton,
  OryCheckbox,
  OryCodeInput,
  OryInput,
  OryRegistrationInput,
} from "./flowcomponents/Nodes";
import { OrySsoButton, OrySsoRoot, OrySsoSettings } from "./flowcomponents/SSO";

export const loginComponentOverrides: OryFlowComponentOverrides = {
  Node: {
    Button: OryButton,
    SsoButton: OrySsoButton,
    Input: OryInput,
    CodeInput: OryCodeInput,
    Checkbox: OryCheckbox,
  },
  Form: {
    SsoRoot: OrySsoRoot,
    SsoSettings: OrySsoSettings,
  },
  Card: {
    Root: OryCardRootTransparent,
    Header: OryCardHeader,
    Footer: OryCardFooter,
    Divider: OryCardDivider,
    AuthMethodListItem: OryAuthMethodListItem,
    SettingsSection: OrySettingsSection,
    SettingsSectionContent: OrySettingsSectionContent,
    SettingsSectionFooter: OrySettingsSectionFooter,
  },
  Message: {
    Content: OryMessageContent,
    Toast: OryToast,
  },
};

export const oryComponentOverrides: OryFlowComponentOverrides = {
  Node: {
    Button: OryButton,
    SsoButton: OrySsoButton,
    Input: OryRegistrationInput,
    CodeInput: OryCodeInput,
    Checkbox: OryCheckbox,
  },
  Form: {
    SsoRoot: OrySsoRoot,
    SsoSettings: OrySsoSettings,
  },
  Card: {
    Root: OryCardRoot,
    Header: OryCardHeader,
    Footer: OryCardFooter,
    Divider: OryCardDivider,
    AuthMethodListItem: OryAuthMethodListItem,
    SettingsSection: OrySettingsSection,
    SettingsSectionContent: OrySettingsSectionContent,
    SettingsSectionFooter: OrySettingsSectionFooter,
  },
  Message: {
    Content: OryMessageContent,
    Toast: OryToast,
  },
};
