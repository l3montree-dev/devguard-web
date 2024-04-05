import { PersonalAccessTokenDTO } from "@/types/api/api";
import { browserApiClient } from "./flawFixApi";

const createPat = async (data: { description: string }) => {
  const pat: PersonalAccessTokenDTO = await (
    await browserApiClient("/pats/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  ).json();
  return pat;
};

export { createPat };
