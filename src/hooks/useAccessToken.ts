// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserApiClient } from "@/services/devGuardApi";
import { createAccessToken as createAccessToken } from "@/services/accessTokenService";
import type {
  AccessTokenDTO as AccessTokenDTO,
  SeeOncePatWithBearerToken as SeeOnceATWithBearerToken,
  SeeOncePatWithPrivKey as SeeOnceATWithPrivKey,
} from "@/types/api/api";
import { EventEmitter } from "events";
import { findLast, uniqBy } from "lodash";
import { useEffect, useState } from "react";
import useScopedAccessToken from "./useScopedAccessToken";
import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./useSessionStorage";

const hasPrivKey = (pat: Token): pat is SeeOnceATWithPrivKey =>
  "privKey" in pat && Boolean(pat.privKey);

import type { Token } from "@/types/view/accessToken";
// this is needed if the useAccessToken hook is used in multiple components, so that they can all listen to the same event emitter for new ATs
// otherwise the second useAccessToken hook would not be aware of the new AT created in the first hook, and would not update its state accordingly
const newATEventEmitter = new EventEmitter();
export default function useAccessToken(
  existingAccessTokens?: Array<AccessTokenDTO>,
  url?: string,
) {
  const scopedUrl = useScopedAccessToken();
  const baseUrl = url ?? scopedUrl;
  const scopedAT = `pat:${baseUrl}`;
  const [accessTokens, setAccessTokens] = useState<Array<Token>>(() => {
    let accessTokens = existingAccessTokens ?? [];
    // merge existing ATs with newly created ones (privKey)
    const newlyCreated = accessTokens.filter((p) => "privKey" in p);
    return uniqBy([...accessTokens, ...newlyCreated], "fingerprint");
  });

  useEffect(() => {
    const handleNewAccessToken = (accessToken: Token) => {
      setAccessTokens((prev) => uniqBy([...prev, accessToken], "fingerprint"));
    };

    const stored = readSessionStorage(scopedAT);
    if (stored) {
      const parsed = JSON.parse(stored) as
        SeeOnceATWithPrivKey | SeeOnceATWithBearerToken;
      handleNewAccessToken(parsed);
    }

    newATEventEmitter.on(scopedAT, handleNewAccessToken);
    return () => {
      newATEventEmitter.off(scopedAT, handleNewAccessToken);
    };
  }, [scopedAT]);

  const handleDeleteAccessToken = async (accessToken: AccessTokenDTO) => {
    await browserApiClient(`${baseUrl}${accessToken.id}/`, {
      method: "DELETE",
    });
    setAccessTokens((prev) => prev.filter((p) => p.id !== accessToken.id));
    const storedAccessToken = readSessionStorage(scopedAT);
    if (
      storedAccessToken &&
      JSON.parse(storedAccessToken).id === accessToken.id
    ) {
      removeSessionStorage(scopedAT);
    }
  };

  async function handleCreateAccessToken(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric: true;
  }): Promise<SeeOnceATWithBearerToken>;
  async function handleCreateAccessToken(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: false;
  }): Promise<SeeOnceATWithPrivKey>;
  async function handleCreateAccessToken(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  }): Promise<SeeOnceATWithPrivKey | SeeOnceATWithBearerToken>;
  async function handleCreateAccessToken(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  }): Promise<SeeOnceATWithPrivKey | SeeOnceATWithBearerToken> {
    const accessToken = await createAccessToken(data, baseUrl);

    setAccessTokens((prev) => [...prev, accessToken]);
    writeSessionStorage(scopedAT, JSON.stringify(accessToken));
    newATEventEmitter.emit(scopedAT, accessToken);
    return accessToken;
  }

  return {
    AccessToken: accessTokens,
    onDeleteAccessToken: handleDeleteAccessToken,
    onCreateAccessToken: handleCreateAccessToken,
    accessToken: findLast(accessTokens, hasPrivKey),
  };
}
