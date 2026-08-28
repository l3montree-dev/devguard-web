// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type PathNodeRole = "root" | "dependency" | "vulnerable";

export type Point = [number, number];

export interface NodeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Row {
  top: number;
  bottom: number;
  left: number;
  right: number;
  centerYSum: number;
  count: number;
}

export type Item =
  | { key: string; kind: "roots"; labels: string[] }
  | { key: string; kind: "node"; label: string; role: PathNodeRole }
  | { key: string; kind: "edge"; index: number };
