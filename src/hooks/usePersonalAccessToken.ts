import { browserApiClient } from "@/services/devGuardApi";
import { createPat } from "@/services/patService";
import type {
  AsymmetricPersonalAccessTokenDTO,
  PersonalAccessTokenDTO,
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
  SymmetricPersonalAccessTokenDTO,
} from "@/types/api/api";
import { useEffect, useState, useRef } from "react";
import { EventEmitter } from "events";
import { isEqual } from "lodash";

const newPatEventEmitter = new EventEmitter();

type AccessToken =
  | AsymmetricPersonalAccessTokenDTO
  | SymmetricPersonalAccessTokenDTO
  | SeeOncePatWithPrivKey
  | SeeOncePatWithBearerToken;

const mergeAccessTokens = (tokens: AccessToken[]) => {
  const tokensById = new Map<string, AccessToken>();
  for (const token of tokens) {
    tokensById.set(token.id, token);
  }
  return Array.from(tokensById.values());
};

export default function usePersonalAccessToken(
  existingPats?: Array<PersonalAccessTokenDTO>,
  baseUrl: string = "/pats/",
) {
  const [personalAccessTokens, setPersonalAccessTokens] = useState<
    AccessToken[]
  >(existingPats ?? []);
  const prevExistingPatsRef = useRef<Array<PersonalAccessTokenDTO> | undefined>(
    undefined,
  );

  // Sync with existingPats when SWR data loads or changes.
  useEffect(() => {
    if (existingPats && !isEqual(prevExistingPatsRef.current, existingPats)) {
      prevExistingPatsRef.current = existingPats;
      setPersonalAccessTokens((prev) => {
        // Keep see-once secrets until the user has had a chance to copy them.
        const newlyCreated = prev.filter(
          (pat) => "privKey" in pat || "bearerToken" in pat,
        );
        return mergeAccessTokens([...existingPats, ...newlyCreated]);
      });
    }
  }, [existingPats]);

  useEffect(() => {
    const pat = sessionStorage.getItem("pat");
    if (pat) {
      const parsed = JSON.parse(pat) as
        SeeOncePatWithPrivKey | SeeOncePatWithBearerToken;

      setPersonalAccessTokens((prev) => mergeAccessTokens([...prev, parsed]));
    }

    const handleNewPat = (pat: AccessToken) => {
      setPersonalAccessTokens((prev) => mergeAccessTokens([...prev, pat]));
    };
    newPatEventEmitter.on("pat", handleNewPat);

    return () => {
      newPatEventEmitter.off("pat", handleNewPat);
    };
  }, []);

  const handleDeletePat = async (pat: PersonalAccessTokenDTO) => {
    await browserApiClient(`${baseUrl}${pat.id}/`, {
      method: "DELETE",
    });
    setPersonalAccessTokens((prev) => prev.filter((p) => p.id !== pat.id));
    const storedPat = sessionStorage.getItem("pat");
    if (storedPat && JSON.parse(storedPat).id === pat.id) {
      sessionStorage.removeItem("pat");
    }
  };

  async function handleCreatePat(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric: true;
  }): Promise<SeeOncePatWithBearerToken>;
  async function handleCreatePat(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: false;
  }): Promise<SeeOncePatWithPrivKey>;
  async function handleCreatePat(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  }): Promise<SeeOncePatWithPrivKey | SeeOncePatWithBearerToken>;
  async function handleCreatePat(data: {
    description: string;
    scopes: string;
    expiryDateUnix: number;
    symmetric?: boolean;
  }): Promise<SeeOncePatWithPrivKey | SeeOncePatWithBearerToken> {
    const pat = await createPat(data, baseUrl);

    setPersonalAccessTokens((prev) => mergeAccessTokens([...prev, pat]));
    sessionStorage.setItem("pat", JSON.stringify(pat));
    newPatEventEmitter.emit("pat", pat);
    return pat;
  }

  return {
    personalAccessTokens,
    onDeletePat: handleDeletePat,
    onCreatePat: handleCreatePat,
    pat:
      personalAccessTokens.length > 0
        ? (personalAccessTokens[
            personalAccessTokens.length - 1
          ] as SeeOncePatWithPrivKey)
        : undefined,
  };
}
