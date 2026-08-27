// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface AssetVersionDeletedEvent {}

export type Events = {
  assetVersionDeleted: AssetVersionDeletedEvent;
};

export type Listener<T extends keyof Events> = {
  id: string;
  callback: (payload: Events[T]) => void;
};
