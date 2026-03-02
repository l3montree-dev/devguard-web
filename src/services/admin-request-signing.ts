// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sign } from "@ltonetwork/http-message-signatures";

/**
 * ECDSA P-256 Signer for HTTP Message Signatures.
 * Compatible with the Go backend's pat_service.go verification.
 * Signs requests using the "sig77" label over "@method" and "content-digest" components.
 */
class EcdsaP256Signer {
  alg = "ecdsa-p256-sha256";
  private privateKey: CryptoKey | null = null;

  constructor(public keyid: string = "sig77") {}

  async init(hexPrivateKey: string): Promise<void> {
    const d = BigInt("0x" + hexPrivateKey);

    const dBytes = new Uint8Array(32);
    let dValue = d;
    for (let i = 31; i >= 0; i--) {
      dBytes[i] = Number(dValue & BigInt(0xff));
      dValue = dValue >> BigInt(8);
    }

    const { x, y } = await this.derivePublicKeyPoint(d);

    const jwk = {
      kty: "EC",
      crv: "P-256",
      d: this.base64UrlEncode(dBytes),
      x: this.base64UrlEncode(x),
      y: this.base64UrlEncode(y),
      ext: true,
    };

    this.privateKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"],
    );
  }

  private async derivePublicKeyPoint(
    d: bigint,
  ): Promise<{ x: Uint8Array; y: Uint8Array }> {
    const p = BigInt(
      "0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF",
    );
    const a = BigInt(
      "0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC",
    );
    const Gx = BigInt(
      "0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296",
    );
    const Gy = BigInt(
      "0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",
    );

    const { x, y } = this.scalarMultP256(d, Gx, Gy, a, p);

    return { x: this.bigIntToBytes(x, 32), y: this.bigIntToBytes(y, 32) };
  }

  private scalarMultP256(
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
          const result = this.pointAddP256(Rx, Ry, Qx, Qy, a, p);
          Rx = result.x;
          Ry = result.y;
        }
      }

      if (i < 255) {
        const result = this.pointDoubleP256(Qx, Qy, a, p);
        Qx = result.x;
        Qy = result.y;
      }
    }

    return { x: Rx, y: Ry };
  }

  private pointAddP256(
    x1: bigint,
    y1: bigint,
    x2: bigint,
    y2: bigint,
    a: bigint,
    p: bigint,
  ): { x: bigint; y: bigint } {
    if (x1 === x2 && y1 === y2) {
      return this.pointDoubleP256(x1, y1, a, p);
    }
    const slope = this.modDiv(y2 - y1, x2 - x1, p);
    const x3 = this.mod(slope * slope - x1 - x2, p);
    const y3 = this.mod(slope * (x1 - x3) - y1, p);
    return { x: x3, y: y3 };
  }

  private pointDoubleP256(
    x: bigint,
    y: bigint,
    a: bigint,
    p: bigint,
  ): { x: bigint; y: bigint } {
    const slope = this.modDiv(BigInt(3) * x * x + a, BigInt(2) * y, p);
    const x3 = this.mod(slope * slope - BigInt(2) * x, p);
    const y3 = this.mod(slope * (x - x3) - y, p);
    return { x: x3, y: y3 };
  }

  private modDiv(a: bigint, b: bigint, p: bigint): bigint {
    return this.mod(a * this.modInv(b, p), p);
  }

  private modInv(a: bigint, m: bigint): bigint {
    a = this.mod(a, m);
    let [oldR, r] = [a, m];
    let [oldS, s] = [BigInt(1), BigInt(0)];

    while (r !== BigInt(0)) {
      const quotient = oldR / r;
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }

    return this.mod(oldS, m);
  }

  private mod(n: bigint, m: bigint): bigint {
    return ((n % m) + m) % m;
  }

  private bigIntToBytes(n: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = length - 1; i >= 0; i--) {
      bytes[i] = Number(n & BigInt(0xff));
      n = n >> BigInt(8);
    }
    return bytes;
  }

  async sign(data: string): Promise<Uint8Array> {
    if (!this.privateKey) {
      throw new Error("Signer not initialized");
    }

    const encoded = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.privateKey,
      encoded,
    );

    return new Uint8Array(signature);
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...Array.from(bytes)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
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
 * Sign an HTTP request for admin authentication.
 * Returns the headers that need to be added to the fetch request.
 */
export async function signAdminRequest(
  url: string,
  method: string,
  body: string | undefined,
  hexPrivateKey: string,
): Promise<Record<string, string>> {
  const signer = new EcdsaP256Signer("sig77");
  await signer.init(hexPrivateKey);

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
