import test from "node:test";
import assert from "node:assert/strict";
import { createVerify, generateKeyPairSync } from "node:crypto";
import { signMuxPlaybackToken } from "../lib/mux.js";

test("Mux playback token is RS256-signed with the expected claims", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const previous = {
    keyId: process.env.MUX_SIGNING_KEY_ID,
    privateKey: process.env.MUX_PRIVATE_KEY,
  };
  process.env.MUX_SIGNING_KEY_ID = "test-key";
  process.env.MUX_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  try {
    const token = signMuxPlaybackToken("playback-123", 300);
    const [header, payload, signature] = token.split(".");
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${header}.${payload}`);
    verifier.end();
    assert.equal(verifier.verify(publicKey, Buffer.from(signature.replace(/-/g, "+").replace(/_/g, "/"), "base64")), true);
    const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    assert.equal(decodedHeader.alg, "RS256");
    assert.equal(decodedHeader.kid, "test-key");
    assert.equal(decodedPayload.sub, "playback-123");
    assert.equal(decodedPayload.aud, "v");
    assert.ok(decodedPayload.exp > Math.floor(Date.now() / 1000));
  } finally {
    if (previous.keyId === undefined) delete process.env.MUX_SIGNING_KEY_ID; else process.env.MUX_SIGNING_KEY_ID = previous.keyId;
    if (previous.privateKey === undefined) delete process.env.MUX_PRIVATE_KEY; else process.env.MUX_PRIVATE_KEY = previous.privateKey;
  }
});
