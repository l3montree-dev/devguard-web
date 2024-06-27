import { browserApiClient } from "@/services/flawFixApi";
import { createPat } from "@/services/patService";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { useState } from "react";

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

  const handleCreatePat = async (data: { description: string }) => {
    const pat = await createPat(data);
    setPersonalAccessTokens([...personalAccessTokens, pat]);
  };

  return {
    personalAccessTokens,
    onDeletePat: handleDeletePat,
    onCreatePat: handleCreatePat,
  };
}
