import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { browserApiClient } from "./flawFixApi";
import { generateKeyPair } from "./Key";

const createPat = async (data: {
  description: string;
}): Promise<PatWithPrivKey> => {
  // generate public private key pair
  const { privateKey, publicKey } = await generateKeyPair();

  const d = { ...data, pubKey: publicKey };

  console.log("privateKey:  ", privateKey, "publicKey: ", publicKey);

  const pat: PersonalAccessTokenDTO = await (
    await browserApiClient("/pats/", {
      method: "POST",
      // send pubkey - maybe hex encode it beforehand
      body: JSON.stringify(d),
    })
  ).json();

  return {
    ...pat,
    privKey: privateKey,
  };
};

export { createPat };
