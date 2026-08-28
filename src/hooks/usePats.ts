// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type {
  AsymmetricAccessTokenDTO,
  SymmetricAccessTokenDTO,
} from "@/types/view/accessToken";

// The token list is served at user, organization, project and asset scope, so
// the caller supplies the route it belongs to.
export const usePats = (url: string) =>
  useSWR<Array<SymmetricAccessTokenDTO | AsymmetricAccessTokenDTO>>(
    url,
    fetcher,
    { fallbackData: [] },
  );
