// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type TokenType =
  "number" | "string" | "ident" | "bool" | "null" | "punct" | "eof";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}
