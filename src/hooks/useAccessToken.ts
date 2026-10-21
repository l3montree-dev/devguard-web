// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { apiFetch } from "@/services/apiClient";
import { createAccessToken } from "@/services/accessTokenService";
import type {
  AccessTokenDTO,
  SeeOncePatWithBearerToken as SeeOnceATWithBearerToken,
  SeeOncePatWithPrivKey as SeeOnceATWithPrivKey,
  Token,
} from "@/types/view/accessToken";

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
  const [createdTokens, setCreatedTokens] = useState<Array<Token>>([]);
  const [deletedIds, setDeletedIds] = useState<Array<string>>([]);
  const accessTokens = uniqBy(
    [...createdTokens, ...(existingAccessTokens ?? [])],
    "fingerprint",
  ).filter((p) => !deletedIds.includes(p.id));

  useEffect(() => {
    const handleNewAccessToken = (accessToken: Token) => {
      setCreatedTokens((prev) => uniqBy([...prev, accessToken], "fingerprint"));
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
    await apiFetch(`${baseUrl}${accessToken.id}/`, {
      method: "DELETE",
    });
    setDeletedIds((prev) => [...prev, accessToken.id]);
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

    setCreatedTokens((prev) => [...prev, accessToken]);
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
