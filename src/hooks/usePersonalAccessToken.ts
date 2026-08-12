import { browserApiClient } from "@/services/devGuardApi";
import { createPat } from "@/services/patService";
import type {
  AsymmetricPersonalAccessTokenDTO,
  PersonalAccessTokenDTO,
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
  SymmetricPersonalAccessTokenDTO,
} from "@/types/api/api";
import { EventEmitter } from "events";
import { findLast, uniqBy } from "lodash";
import { useEffect, useState } from "react";
import useScopedAccessToken from "./useScopedAccessToken";

const hasPrivKey = (pat: Token): pat is SeeOncePatWithPrivKey =>
  "privKey" in pat && Boolean(pat.privKey);

type Token =
  | AsymmetricPersonalAccessTokenDTO
  | SymmetricPersonalAccessTokenDTO
  | SeeOncePatWithPrivKey
  | SeeOncePatWithBearerToken;
// this is needed if the usePersonalAccessToken hook is used in multiple components, so that they can all listen to the same event emitter for new PATs
// otherwise the second usePersonalAccessToken hook would not be aware of the new PAT created in the first hook, and would not update its state accordingly
const newPatEventEmitter = new EventEmitter();
export default function usePersonalAccessToken(
  existingPats?: Array<PersonalAccessTokenDTO>,
) {
  const baseUrl = useScopedAccessToken();
  const scopedAT = `pat:${baseUrl}`;
  const [personalAccessTokens, setPersonalAccessTokens] = useState<
    Array<Token>
  >(() => {
    let pats = existingPats ?? [];
    // merge existing pats with newly created ones (privKey)
    const newlyCreated = pats.filter((p) => "privKey" in p);
    return uniqBy([...pats, ...newlyCreated], "fingerprint");
  });

  useEffect(() => {
    const handleNewPat = (pat: Token) => {
      setPersonalAccessTokens((prev) => uniqBy([...prev, pat], "fingerprint"));
    };

    const stored = sessionStorage.getItem(scopedAT);
    if (stored) {
      const parsed = JSON.parse(stored) as
        SeeOncePatWithPrivKey | SeeOncePatWithBearerToken;
      handleNewPat(parsed);
    }

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
