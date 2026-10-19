import { createSign, createPrivateKey } from "node:crypto";

const base64url = (value) => Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const getSigningConfig = () => {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  let privateKey = process.env.MUX_PRIVATE_KEY;
  
  if (!keyId || !privateKey) {
    throw new Error("Mux signed playback is not configured. Set MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY.");
  }

  privateKey = privateKey.trim();

  // If the key is a raw string without PEM headers, wrap it into standard PKCS#8 PEM format
  if (!privateKey.includes("-----BEGIN")) {
    const chunkedKey = privateKey.match(/.{1,64}/g).join("\n");
    privateKey = `-----BEGIN PRIVATE KEY-----\n${chunkedKey}\n-----END PRIVATE KEY-----`;
  } else {
    privateKey = privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
  }

  try {
    // Convert the PEM string into a Node.js KeyObject to satisfy OpenSSL 3 requirements
    const keyObject = createPrivateKey({
      key: privateKey,
      format: "pem",
    });
    return {
      keyId,
      privateKey: keyObject,
    };
  } catch (err) {
    throw new Error(`Failed to parse MUX_PRIVATE_KEY: ${err.message}`);
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