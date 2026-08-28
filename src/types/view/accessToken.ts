// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type Token =
  | AsymmetricAccessTokenDTO
  | SymmetricAccessTokenDTO
  | SeeOncePatWithPrivKey
  | SeeOncePatWithBearerToken;

export type AccessTokenDTO = AsymmetricAccessTokenDTO | SymmetricAccessTokenDTO;

export interface AsymmetricAccessTokenDTO extends AccessTokenBase {
  pubKey: string;
  fingerprint: string;
}

export interface SymmetricAccessTokenDTO extends AccessTokenBase {}

export interface SeeOncePatWithPrivKey extends AccessTokenBase {
  privKey: string;
}

export interface SeeOncePatWithBearerToken extends AccessTokenBase {
  bearerToken: string;
}

interface AccessTokenBase {
  description: string;
  scopes: string;
  userId: string;
  createdAt: string;
  id: string;
  expiryDateUnix: number;
  lastUsedAt: string | null;
}
