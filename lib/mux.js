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

  // Return cached key object if config hasn't changed
  if (cachedKeyObject && cachedKeyId === keyId) {
    return { keyId, privateKey: cachedKeyObject };
  }

  // Clean up surrounding quotes and escaped newlines
  privateKey = privateKey.trim().replace(/^["']|["']$/g, "").trim().replace(/\\n/g, "\n");

  let keyObject = null;
  const errors = [];

  // Attempt 1: If it has PEM headers, parse directly as PEM
  if (privateKey.includes("-----BEGIN")) {
    try {
      keyObject = createPrivateKey({ key: privateKey, format: "pem" });
    } catch (err) {
      errors.push(`PEM parse failed: ${err.message}`);
    }
  }

  // Attempt 2: Treat as raw Base64 DER (PKCS#8 or PKCS#1)
  if (!keyObject) {
    const cleanBase64 = privateKey.replace(/[\r\n\s]+/g, "");
    const derBuffer = Buffer.from(cleanBase64, "base64");

    // Try PKCS#8 DER
    try {
      keyObject = createPrivateKey({ key: derBuffer, format: "der", type: "pkcs8" });
    } catch (err1) {
      errors.push(`DER PKCS#8 parse failed: ${err1.message}`);
      
      // Try PKCS#1 DER
      try {
        keyObject = createPrivateKey({ key: derBuffer, format: "der", type: "pkcs1" });
      } catch (err2) {
        errors.push(`DER PKCS#1 parse failed: ${err2.message}`);
      }
    }
  }

  // Attempt 3: Try wrapping raw Base64 into standard PEM formats
  if (!keyObject) {
    const cleanBase64 = privateKey.replace(/[\r\n\s]+/g, "");
    const chunkedKey = cleanBase64.match(/.{1,64}/g)?.join("\n");
    if (chunkedKey) {
      // Try PKCS#8 PEM wrapper
      try {
        keyObject = createPrivateKey({ 
          key: `-----BEGIN PRIVATE KEY-----\n${chunkedKey}\n-----END PRIVATE KEY-----`, 
          format: "pem" 
        });
      } catch (err3) {
        errors.push(`Wrapped PKCS#8 PEM failed: ${err3.message}`);
        
        // Try PKCS#1 PEM wrapper
        try {
          keyObject = createPrivateKey({ 
            key: `-----BEGIN RSA PRIVATE KEY-----\n${chunkedKey}\n-----END RSA PRIVATE KEY-----`, 
            format: "pem" 
          });
        } catch (err4) {
          errors.push(`Wrapped PKCS#1 PEM failed: ${err4.message}`);
        }
      }
    }
  }

  if (!keyObject) {
    throw new Error(`OpenSSL failed to parse MUX_PRIVATE_KEY. All parsing strategies failed:\n- ${errors.join("\n- ")}`);
  }

  cachedKeyObject = keyObject;
  cachedKeyId = keyId;

  return {
    keyId,
    privateKey: keyObject,
  };
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