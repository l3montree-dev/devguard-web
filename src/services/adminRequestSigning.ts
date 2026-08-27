// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sign } from "@ltonetwork/http-message-signatures";

// ── P-256 elliptic-curve helpers ───────────────────────────────────────────
// Used once, at key-import time, to derive the public point (x, y) from the
// private scalar d so we can build a full JWK. After import the raw scalar is
// discarded and only a non-extractable CryptoKey is retained.

const P256_P = BigInt(
  "0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF",
);
const P256_A = BigInt(
  "0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC",
);
const P256_GX = BigInt(
  "0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296",
);
const P256_GY = BigInt(
  "0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",
);

function mod(n: bigint, m: bigint): bigint {
  return ((n % m) + m) % m;
}

function modInv(a: bigint, m: bigint): bigint {
  a = mod(a, m);
  let [oldR, r] = [a, m];
  let [oldS, s] = [BigInt(1), BigInt(0)];
  while (r !== BigInt(0)) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  return mod(oldS, m);
}

function modDiv(a: bigint, b: bigint, p: bigint): bigint {
  return mod(a * modInv(b, p), p);
}

function pointDoubleP256(
  x: bigint,
  y: bigint,
  a: bigint,
  p: bigint,
): { x: bigint; y: bigint } {
  const slope = modDiv(BigInt(3) * x * x + a, BigInt(2) * y, p);
  const x3 = mod(slope * slope - BigInt(2) * x, p);
  const y3 = mod(slope * (x - x3) - y, p);
  return { x: x3, y: y3 };
}

function pointAddP256(
  x1: bigint,
  y1: bigint,
  x2: bigint,
  y2: bigint,
  a: bigint,
  p: bigint,
): { x: bigint; y: bigint } {
  if (x1 === x2 && y1 === y2) {
    return pointDoubleP256(x1, y1, a, p);
  }
  const slope = modDiv(y2 - y1, x2 - x1, p);
  const x3 = mod(slope * slope - x1 - x2, p);
  const y3 = mod(slope * (x1 - x3) - y1, p);
  return { x: x3, y: y3 };
}

function scalarMultP256(
  k: bigint,
  Gx: bigint,
  Gy: bigint,
  a: bigint,
  p: bigint,
): { x: bigint; y: bigint } {
  let Rx = BigInt(0);
  let Ry = BigInt(0);
  let isInfinity = true;

  let Qx = Gx;
  let Qy = Gy;

  for (let i = 0; i < 256; i++) {
    if ((k >> BigInt(i)) & BigInt(1)) {
      if (isInfinity) {
        Rx = Qx;
        Ry = Qy;
        isInfinity = false;
      } else {
        const result = pointAddP256(Rx, Ry, Qx, Qy, a, p);
        Rx = result.x;
        Ry = result.y;
      }
    }
    if (i < 255) {
      const result = pointDoubleP256(Qx, Qy, a, p);
      Qx = result.x;
      Qy = result.y;
    }
  }
  return { x: Rx, y: Ry };
}

function bigIntToBytes(n: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n = n >> BigInt(8);
  }
  return bytes;
}

function derivePublicKeyPoint(d: bigint): { x: Uint8Array; y: Uint8Array } {
  const { x, y } = scalarMultP256(d, P256_GX, P256_GY, P256_A, P256_P);
  return { x: bigIntToBytes(x, 32), y: bigIntToBytes(y, 32) };
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(bytes)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Import a hex-encoded ECDSA P-256 private key into a **non-extractable**
 * CryptoKey usable for signing. The raw hex is consumed only here and never
 * persisted; the returned key's material cannot be exported afterwards.
 *
 * Throws on invalid hex so callers can surface a clear error.
 */
export async function importAdminKey(
  hexPrivateKey: string,
): Promise<CryptoKey> {
  if (!/^[0-9a-fA-F]+$/.test(hexPrivateKey)) {
    throw new Error("Invalid private key: expected a non-empty hex string");
  }

  const d = BigInt("0x" + hexPrivateKey);
  const dBytes = bigIntToBytes(d, 32);
  const { x, y } = derivePublicKeyPoint(d);

  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    d: base64UrlEncode(dBytes),
    x: base64UrlEncode(x),
    y: base64UrlEncode(y),
    ext: false,
  };

  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false, // non-extractable: the key material can never leave the browser
    ["sign"],
  );
}

/**
 * ECDSA P-256 Signer for HTTP Message Signatures, backed by a pre-imported
 * non-extractable CryptoKey. Compatible with the Go backend's pat_service.go
 * verification — signs the "sig77"-labelled "@method" and "content-digest"
 * components.
 */
class EcdsaP256Signer {
  alg = "ecdsa-p256-sha256";

  constructor(
    public keyid: string,
    private key: CryptoKey,
  ) {}

  async sign(data: string): Promise<Uint8Array> {
    const encoded = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.key,
      encoded,
    );
    return new Uint8Array(signature);
  }
}

/**
 * Compute the SHA-256 Content-Digest header value for a request body.
 */
async function computeContentDigest(body: string): Promise<string> {
  if (!body) {
    // Empty body digest (pre-computed SHA-256 of empty string)
    return "sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:";
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  return `sha-256=:${hashBase64}:`;
}

/**
 * Sign an HTTP request for admin authentication using a pre-imported
 * non-extractable CryptoKey. Returns the headers to add to the fetch request.
 */
export async function signAdminRequest(
  url: string,
  method: string,
  body: string | undefined,
  key: CryptoKey,
): Promise<Record<string, string>> {
  const signer = new EcdsaP256Signer("sig77", key);

  const contentDigest = await computeContentDigest(body ?? "");

  const headers = new Headers();
  headers.set("Content-Digest", contentDigest);

  const request = new Request(url, {
    method,
    headers,
    body: body ? body : undefined,
  });

  await sign(request, {
    key: "sig77",
    signer,
    components: ["@method", "content-digest"],
  });

  // Extract the signing headers from the signed request
  const result: Record<string, string> = {};
  result["Content-Digest"] = request.headers.get("Content-Digest") ?? "";
  result["Signature"] = request.headers.get("Signature") ?? "";
  result["Signature-Input"] = request.headers.get("Signature-Input") ?? "";

  return result;
}
