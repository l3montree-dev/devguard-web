// Ref: https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c

// Convert an ArrayBuffer into a string.
// From https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

export const generateKeyPair = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  let privateKey = "1";
  let publicKey = "2";

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  const privateKeyPEM = await pemEncodedPrivateKey(keyPair);
  const privatePemEncodeKey = pemEncode("PRIVATE KEY", privateKeyPEM);
  const privateHexEncodeKey = toHex(privatePemEncodeKey);

  privateKey = privateHexEncodeKey;

  const publicKeyPEM = await pemEncodedPublicKey(keyPair);
  const publicPemEncodeKey = pemEncode("PUBLIC KEY", publicKeyPEM);
  const publicHexEncodeKey = toHex(publicPemEncodeKey);

  publicKey = publicHexEncodeKey;

  return {
    privateKey,
    publicKey,
  };
};

function arrayBufToString(buf: any) {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// base64 encode
function pemEncode(label: string, data: string) {
  const base64encoded = window.btoa(data);
  const base64encodedWrapped = base64encoded.replace(/(.{64})/g, "$1\n");
  return base64encodedWrapped;
  return `-----BEGIN ${label}-----\n${base64encodedWrapped}\n-----END ${label}-----`;
}

async function exportKeyAsString(format: any, key: CryptoKey) {
  const exported = await window.crypto.subtle.exportKey(format, key);
  return arrayBufToString(exported);
}

async function pemEncodedPrivateKey(keyPair: CryptoKeyPair) {
  const exported = await exportKeyAsString("pkcs8", keyPair.privateKey);
  return exported;
}

async function pemEncodedPublicKey(keyPair: CryptoKeyPair) {
  const exported = await exportKeyAsString("spki", keyPair.publicKey);
  return exported;
}

const toHex = (plain: string) =>
  plain
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

const fromHex = (hex: any) =>
  hex
    .match(/.{1,2}/g)
    .map((byte: any) => String.fromCharCode(parseInt(byte, 16)))
    .join("");
