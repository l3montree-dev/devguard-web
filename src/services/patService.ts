import type {
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
} from "@/types/api/api";
import { browserApiClient } from "./devGuardApi";
import { generateKeyPair } from "./keyService";

async function createPat(data: {
  description: string;
  scopes: string;
  expiryDateUnix: number;
  symmetric: true;
}): Promise<SeeOncePatWithBearerToken>;
async function createPat(data: {
  description: string;
  scopes: string;
  expiryDateUnix: number;
  symmetric?: false;
}): Promise<SeeOncePatWithPrivKey>;
async function createPat(data: {
  description: string;
  scopes: string;
  expiryDateUnix: number;
  symmetric?: boolean;
}): Promise<SeeOncePatWithPrivKey | SeeOncePatWithBearerToken>;
async function createPat(data: {
  description: string;
  scopes: string;
  expiryDateUnix: number;
  symmetric?: boolean;
}): Promise<SeeOncePatWithPrivKey | SeeOncePatWithBearerToken> {
  if (data.symmetric) {
    const resp = await browserApiClient("/pats/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error("Failed to create PAT");
    }

    const pat: SeeOncePatWithBearerToken = await resp.json();
    return pat;
  }

  // generate public private key pair
  const { privateKey, publicKey } = await generateKeyPair();

  const d = { ...data, pubKey: publicKey };

  const resp = await browserApiClient("/pats/", {
    method: "POST",
    // send hex-encoded pubkey
    body: JSON.stringify(d),
  });
  if (!resp.ok) {
    throw new Error("Failed to create PAT");
  }
  const pat = await resp.json();

  return {
    ...pat,
    privKey: privateKey,
  } as SeeOncePatWithPrivKey;
}

export { createPat };
