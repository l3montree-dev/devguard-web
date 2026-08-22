// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type StyleSettings = {
  shadowPreset: string;
  fontFamily: string;
  displayFont: string;
  fontSize: string;
  letterSpacing: string;
  lineHeight: string;
};

export type Theme = {
  name: string;
  description: string;
  swatch: string;
  dark: boolean;
  vars: Record<string, string>;
  style: StyleSettings;
};

export type VarGroup = {
  label: string;
  vars: string[];
};

export type ShadowPreset = { label: string; css: string | null };

export type FontPreset = { label: string; stack: string };

export type TabType = "themes" | "style" | "vars";
