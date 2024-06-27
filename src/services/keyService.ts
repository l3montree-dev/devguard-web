export const generateKeyPair = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  let privateKey = "";
  let publicKey = "";

  // Generate an ECDSA P-256 key pair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true, // extractable
    ["sign", "verify"],
  );

  // Export the private key in JWK format
  const exportedPrivateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );

  // Export the public key in JWK format
  const exportedPublicKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey,
  );

  // Extract the raw private key bytes (base64url decode the 'd' field)
  const rawPrivateKeyBytes = base64urlDecode(exportedPrivateKey.d as string);

  // Convert to a hex string for easier reading (optional)
  const hexPrivateKey = Array.from(rawPrivateKeyBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  // Extract the raw public key coordinates (base64url decode the 'x' and 'y' fields)
  const rawPublicKeyXBytes = base64urlDecode(exportedPublicKey.x as string);
  const rawPublicKeyYBytes = base64urlDecode(exportedPublicKey.y as string);

  // Convert to hex strings for easier reading (optional)
  const hexPublicKeyX = Array.from(rawPublicKeyXBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const hexPublicKeyY = Array.from(rawPublicKeyYBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  // Combine x and y coordinates into a single string
  const combinedPublicKey = hexPublicKeyX + hexPublicKeyY;

  privateKey = hexPrivateKey;
  publicKey = combinedPublicKey;

  return {
    privateKey,
    publicKey,
  };
};

// Function to decode base64url
function base64urlDecode(base64url: string) {
  // Add padding if missing
  while (base64url.length % 4) {
    base64url += "=";
  }
  // Replace URL-safe characters
  base64url = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // Decode Base64
  const decodedString = atob(base64url);
  // Convert to Uint8Array
  const byteArray = new Uint8Array(decodedString.length);
  for (let i = 0; i < decodedString.length; i++) {
    byteArray[i] = decodedString.charCodeAt(i);
  }
  return byteArray;
}
