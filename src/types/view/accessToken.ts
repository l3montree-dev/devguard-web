// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  AsymmetricAccessTokenDTO,
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
  SymmetricAccessTokenDTO,
} from "@/types/api/api";

export type Token =
  | AsymmetricAccessTokenDTO
  | SymmetricAccessTokenDTO
  | SeeOncePatWithPrivKey
  | SeeOncePatWithBearerToken;
