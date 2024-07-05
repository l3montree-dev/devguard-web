import { PatWithPrivKey, PersonalAccessTokenDTO } from "@/types/api/api";
import { browserApiClient } from "./devGuardApi";
import { generateKeyPair } from "./keyService";

const createPat = async (data: {
  description: string;
}): Promise<PatWithPrivKey> => {
  // generate public private key pair
  const { privateKey, publicKey } = await generateKeyPair();

  const d = { ...data, pubKey: publicKey };

  const pat: PersonalAccessTokenDTO = await (
    await browserApiClient("/pats/", {
      method: "POST",
      // send hex-encoded pubkey
      body: JSON.stringify(d),
    })
  ).json();

  return {
    ...pat,
    privKey: privateKey,
  };
};

export { createPat };
