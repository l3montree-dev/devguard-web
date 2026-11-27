// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useSyncExternalStore } from "react";
import { ALTCHA_COOKIE_NAME } from "@/const/altcha";

const subscribe = () => () => {};

const getSnapshot = () =>
  document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${ALTCHA_COOKIE_NAME}=`));

const getServerSnapshot = () => false;

export const useAltchaSolved = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
