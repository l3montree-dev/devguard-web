// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserApiClient } from "./devGuardApi";
import { generateKeyPair } from "./keyService";
import type {
  SeeOncePatWithBearerToken as SeeOnceAccessTokenWithBearerToken,
  SeeOncePatWithPrivKey as SeeOnceAccessTokenWithPrivKey,
} from "@/types/view/accessToken";

async function createAccessToken(
  data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric: true;
  },
  url?: string,
): Promise<SeeOnceAccessTokenWithBearerToken>;
async function createAccessToken(
  data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: false;
  },
  url?: string,
): Promise<SeeOnceAccessTokenWithPrivKey>;
async function createAccessToken(
  data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  },
  url?: string,
): Promise<SeeOnceAccessTokenWithPrivKey | SeeOnceAccessTokenWithBearerToken>;
async function createAccessToken(
  data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  },
  url: string = "/pats/",
): Promise<SeeOnceAccessTokenWithPrivKey | SeeOnceAccessTokenWithBearerToken> {
  if (data.symmetric) {
    const resp = await browserApiClient(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error("Failed to create PAT");
    }

    const accessToken: SeeOnceAccessTokenWithBearerToken = await resp.json();
    return accessToken;
  }

  // generate public private key pair
  const { privateKey, publicKey } = await generateKeyPair();

  const d = { ...data, pubKey: publicKey };

  const resp = await browserApiClient(url, {
    method: "POST",
    // send hex-encoded pubkey
    body: JSON.stringify(d),
  });
  if (!resp.ok) {
    throw new Error("Failed to create PAT");
  }
  const accessToken = await resp.json();

  return {
    ...accessToken,
    privKey: privateKey,
  } as SeeOnceAccessTokenWithPrivKey;
}

export { createAccessToken as createAccessToken };
