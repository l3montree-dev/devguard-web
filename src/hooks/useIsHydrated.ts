// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = () => true;

const getServerSnapshot = () => false;

export const useIsHydrated = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
