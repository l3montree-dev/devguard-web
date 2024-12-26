import { browserApiClient } from "@/services/devGuardApi";
import { createPat } from "@/services/patService";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { useEffect, useState } from "react";
import { EventEmitter } from "events";

const newPatEventEmitter = new EventEmitter();
export default function usePersonalAccessToken(
  existingPats?: PersonalAccessTokenDTO[],
) {
  const [personalAccessTokens, setPersonalAccessTokens] = useState<
    Array<PersonalAccessTokenDTO | PatWithPrivKey>
  >(existingPats ?? []);
  const handleDeletePat = async (pat: PersonalAccessTokenDTO) => {
    await browserApiClient(`/pats/${pat.id}/`, {
      method: "DELETE",
    });
    setPersonalAccessTokens(
      personalAccessTokens.filter((p) => p.id !== pat.id),
    );
  };

  useEffect(() => {
    const pat = sessionStorage.getItem("pat");
    if (pat) {
      setPersonalAccessTokens((prev) => [...prev, JSON.parse(pat)]);
    }
    newPatEventEmitter.on("pat", (pat) => {
      setPersonalAccessTokens((prev) => [...prev, pat]);
    });
  }, []);

  const handleCreatePat = async (data: { description: string }) => {
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
        ? (personalAccessTokens[0] as PatWithPrivKey)
        : undefined,
  };
}
