import { PersonalAccessTokenDTO } from "@/types/api/api";
import { getApiClient } from "./flawFixApi";

const createPat = async (data: { description: string }) => {
  const apiClient = getApiClient(document);
  const pat: PersonalAccessTokenDTO = await (
    await apiClient("/pats/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  ).json();
  return pat;
};

export { createPat };
