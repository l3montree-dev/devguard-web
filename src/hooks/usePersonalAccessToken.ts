import { browserApiClient } from "@/services/devGuardApi";
import { createPat } from "@/services/patService";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { useEffect, useState } from "react";
import { EventEmitter } from "events";
import { uniqBy } from "lodash";

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
      setPersonalAccessTokens((prev) =>
        uniqBy([...prev, JSON.parse(pat)], "fingerprint"),
      );
    }
    newPatEventEmitter.on("pat", (pat) => {
      setPersonalAccessTokens((prev) => uniqBy([...prev, pat], "fingerprint"));
    });
  }, []);

  const handleCreatePat = async (data: {
    description: string;
    scanAsset: boolean;
    manageAsset: boolean;
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
        ? (personalAccessTokens[0] as PatWithPrivKey)
        : undefined,
  };
}
