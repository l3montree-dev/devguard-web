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
import { uniqBy, isEqual, findLast } from "lodash";
import useScopedAccessToken from "./useScopedAccessToken";

const hasPrivKey = (
  pat:
    | AsymmetricPersonalAccessTokenDTO
    | SymmetricPersonalAccessTokenDTO
    | SeeOncePatWithPrivKey
    | SeeOncePatWithBearerToken,
): pat is SeeOncePatWithPrivKey => "privKey" in pat && Boolean(pat.privKey);

const newPatEventEmitter = new EventEmitter();
export default function usePersonalAccessToken(
  existingPats?: Array<PersonalAccessTokenDTO>,
) {
  const baseUrl = useScopedAccessToken();
  const scopedAT = `pat:${baseUrl}`;
  const [personalAccessTokens, setPersonalAccessTokens] = useState<
    Array<
      | AsymmetricPersonalAccessTokenDTO
      | SymmetricPersonalAccessTokenDTO
      | SeeOncePatWithPrivKey
      | SeeOncePatWithBearerToken
    >
  >(existingPats ?? []);
  const prevExistingPatsRef = useRef<Array<PersonalAccessTokenDTO> | undefined>(
    undefined,
  );

  // ync with existingPats when SWR data loads or changes
  useEffect(() => {
    if (existingPats && !isEqual(prevExistingPatsRef.current, existingPats)) {
      prevExistingPatsRef.current = existingPats;
      setPersonalAccessTokens((prev) => {
        // merge existing pats with newly created ones (privKey)
        const newlyCreated = prev.filter((p) => "privKey" in p);
        return uniqBy([...existingPats, ...newlyCreated], "fingerprint");
      });
    }
  }, [existingPats]);

  useEffect(() => {
    const stored = sessionStorage.getItem(scopedAT);
    if (stored) {
      const parsed = JSON.parse(stored) as
        SeeOncePatWithPrivKey | SeeOncePatWithBearerToken;
      setPersonalAccessTokens((prev) =>
        uniqBy([...prev, parsed], "fingerprint"),
      );
    }

    const handleNewPat = (pat) => {
      setPersonalAccessTokens((prev) => uniqBy([...prev, pat], "fingerprint"));
    };

    newPatEventEmitter.on(scopedAT, handleNewPat);
    return () => {
      newPatEventEmitter.off(scopedAT, handleNewPat);
    };
  }, [scopedAT]);

  const handleDeletePat = async (pat: PersonalAccessTokenDTO) => {
    await browserApiClient(`${baseUrl}${pat.id}/`, {
      method: "DELETE",
    });
    setPersonalAccessTokens((prev) => prev.filter((p) => p.id !== pat.id));
    const storedPat = sessionStorage.getItem(scopedAT);
    if (storedPat && JSON.parse(storedPat).id === pat.id) {
      sessionStorage.removeItem(scopedAT);
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

    setPersonalAccessTokens((prev) => [...prev, pat]);
    sessionStorage.setItem(scopedAT, JSON.stringify(pat));
    newPatEventEmitter.emit(scopedAT, pat);
    return pat;
  }

  return {
    personalAccessTokens,
    onDeletePat: handleDeletePat,
    onCreatePat: handleCreatePat,
    pat: findLast(personalAccessTokens, hasPrivKey),
  };
}
