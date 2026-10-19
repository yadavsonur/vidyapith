import { createSign, createPrivateKey } from "node:crypto";

const base64url = (value) => 
  Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const getSigningConfig = () => {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  let privateKey = process.env.MUX_PRIVATE_KEY;
  
  if (!keyId || !privateKey) {
    throw new Error("Mux signing configuration is missing. Set MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY.");
  }

  // 1. Strip surrounding quotes if they were accidentally pasted into Vercel/env files
  privateKey = privateKey.trim().replace(/^["']|["']$/g, "").trim();

  // 2. Handle escaped newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  // 3. If it's a raw string without PEM headers, wrap it into standard PKCS#8 format
  if (!privateKey.includes("-----BEGIN")) {
    const cleanBase64 = privateKey.replace(/\s+/g, "");
    const chunkedKey = cleanBase64.match(/.{1,64}/g)?.join("\n");
    if (!chunkedKey) {
      throw new Error("MUX_PRIVATE_KEY is empty or invalid base64.");
    }
    privateKey = `-----BEGIN PRIVATE KEY-----\n${chunkedKey}\n-----END PRIVATE KEY-----`;
  }

  // 4. Strict parse via Node.js crypto to eliminate OpenSSL decoding mismatch
  try {
    const keyObject = createPrivateKey({
      key: privateKey,
      format: "pem",
    });
    return {
      keyId,
      privateKey: keyObject,
    };
  } catch (err) {
    throw new Error(`OpenSSL failed to parse MUX_PRIVATE_KEY. Check if your Vercel env variable has extra quotes or is an invalid key. Details: ${err.message}`);
  }
};

export const signMuxPlaybackToken = (playbackId, expiresInSeconds = 300) => {
  if (!playbackId) return null;
  
  const { keyId, privateKey } = getSigningConfig();
  
  const header = { alg: "RS256", typ: "JWT", kid: keyId };
  const payload = {
    sub: playbackId,
    aud: "v",
    exp: Math.floor(Date.now() / 1000) + Math.max(60, Math.min(expiresInSeconds, 3600)),
  };
  
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  
  const signature = signer.sign(privateKey);
  return `${signingInput}.${base64url(signature)}`;
};

export const isMuxSigningConfigured = () => Boolean(process.env.MUX_SIGNING_KEY_ID && process.env.MUX_PRIVATE_KEY);