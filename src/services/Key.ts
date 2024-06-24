export const generateKeyPair = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  let privateKey = "1";
  let publicKey = "2";

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

  console.log("Exported Private Key:", exportedPrivateKey);

  // Extract the raw private key bytes (base64url decode the 'd' field)
  const rawPrivateKeyBytes = base64urlDecode(exportedPrivateKey.d);

  // Convert to a hex string for easier reading (optional)
  const hexPrivateKey = Array.from(rawPrivateKeyBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  console.log("Private Key (Hex):", hexPrivateKey);

  // Extract the raw public key coordinates (base64url decode the 'x' and 'y' fields)
  const rawPublicKeyXBytes = base64urlDecode(exportedPublicKey.x);
  const rawPublicKeyYBytes = base64urlDecode(exportedPublicKey.y);

  // Convert to hex strings for easier reading (optional)
  const hexPublicKeyX = Array.from(rawPublicKeyXBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const hexPublicKeyY = Array.from(rawPublicKeyYBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  console.log("Public Key X (Hex):", hexPublicKeyX);
  console.log("Public Key Y (Hex):", hexPublicKeyY);

  // Combine x and y coordinates into a single string
  const combinedPublicKey = hexPublicKeyX + hexPublicKeyY;
  console.log("Combined Public Key (Hex):", combinedPublicKey);

  privateKey = hexPrivateKey;
  publicKey = combinedPublicKey;

  return {
    privateKey,
    publicKey,
  };
};

// Function to decode base64url
function base64urlDecode(base64url: any) {
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
