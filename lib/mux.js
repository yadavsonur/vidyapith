import { createSign, createPrivateKey } from "node:crypto";

const base64url = (value) => 
  Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

let cachedKeyObject = null;
let cachedKeyId = null;

const getSigningConfig = () => {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  let privateKey = process.env.MUX_PRIVATE_KEY;
  
  if (!keyId || !privateKey) {
    throw new Error("Mux signing configuration is missing. Set MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY.");
  }

  if (cachedKeyObject && cachedKeyId === keyId) {
    return { keyId, privateKey: cachedKeyObject };
  }

  // Clean surrounding whitespace and quotes
  privateKey = privateKey.trim().replace(/^["']|["']$/g, "").trim();

  let pemKey = privateKey;

  // Mux signing keys are Base64-encoded PEM strings (starting with 'LS0t' -> '---')
  try {
    const cleanedBase64 = privateKey.replace(/[\r\n\s]+/g, "");
    const decodedBuffer = Buffer.from(cleanedBase64, "base64");
    const decodedText = decodedBuffer.toString("utf8");
    if (decodedText.includes("-----BEGIN")) {
      pemKey = decodedText;
    }
  } catch (e) {
    // Fall back to raw string if base64 decoding isn't needed
  }

  // Normalize Windows CRLF to Linux LF for OpenSSL 3 strictness
  pemKey = pemKey.replace(/\r\n/g, "\n").trim();

  try {
    const keyObject = createPrivateKey({
      key: pemKey,
      format: "pem",
    });

    cachedKeyObject = keyObject;
    cachedKeyId = keyId;

    return {
      keyId,
      privateKey: keyObject,
    };
  } catch (err) {
    throw new Error(`Failed to parse Mux private key with OpenSSL 3: ${err.message}`);
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