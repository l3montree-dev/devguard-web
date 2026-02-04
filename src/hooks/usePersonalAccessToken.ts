import { browserApiClient } from "@/services/devGuardApi";
import { createPat } from "@/services/patService";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { useEffect, useState, useRef } from "react";
import { EventEmitter } from "events";
import { uniqBy, isEqual } from "lodash";

const newPatEventEmitter = new EventEmitter();
export default function usePersonalAccessToken(
  existingPats?: PersonalAccessTokenDTO[],
) {
  const [personalAccessTokens, setPersonalAccessTokens] = useState<
    Array<PersonalAccessTokenDTO | PatWithPrivKey>
  >(existingPats ?? []);
  const prevExistingPatsRef = useRef<PersonalAccessTokenDTO[] | undefined>(undefined);

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
    const pat = sessionStorage.getItem("pat");
    if (pat) {
      setPersonalAccessTokens((prev) =>
        uniqBy([...prev, JSON.parse(pat)], "fingerprint"),
      );
    }
    newPatEventEmitter.on("pat", (pat) => {
      setPersonalAccessTokens((prev) => uniqBy([...prev, pat], "fingerprint"));
    });
  }, []);

  const handleDeletePat = async (pat: PersonalAccessTokenDTO) => {
    await browserApiClient(`/pats/${pat.id}/`, {
      method: "DELETE",
    });
    setPersonalAccessTokens((prev) => prev.filter((p) => p.id !== pat.id));
    const storedPat = sessionStorage.getItem("pat");
    if (storedPat && JSON.parse(storedPat).id === pat.id) {
      sessionStorage.removeItem("pat");
    }
  };

  const handleCreatePat = async (data: {
    description: string;
    scopes: string;
  }) => {
    const pat = await createPat(data);

    setPersonalAccessTokens((prev) => [...prev, pat]);
    sessionStorage.setItem("pat", JSON.stringify(pat));
    newPatEventEmitter.emit("pat", pat);
    return pat;
  };

  return {
    personalAccessTokens,
    onDeletePat: handleDeletePat,
    onCreatePat: handleCreatePat,
    pat:
      personalAccessTokens.length > 0
        ? (personalAccessTokens[
            personalAccessTokens.length - 1
          ] as PatWithPrivKey)
        : undefined,
  };
}
