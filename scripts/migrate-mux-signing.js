const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const baseUrl = "https://api.mux.com/video/v1";

const authHeader = () => `Basic ${Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString("base64")}`;

const muxFetch = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`Mux ${response.status}: ${data?.error?.messages?.join(", ") || data?.error?.message || text || response.statusText}`);
  return data;
};

async function main() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required");
  if (!process.env.MUX_SIGNING_KEY_ID || !process.env.MUX_PRIVATE_KEY) throw new Error("MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY are required for the signed playback application");

  const removePublic = process.env.MUX_REMOVE_PUBLIC_PLAYBACK === "1";
  const rows = await db.muxData.findMany({ where: { assetId: { not: "" } }, select: { id: true, assetId: true, playbackId: true, chapterId: true } });
  let changed = 0;

  for (const row of rows) {
    const asset = await muxFetch(`/assets/${encodeURIComponent(row.assetId)}`);
    const playbackIds = asset?.data?.playback_ids || [];
    let signed = playbackIds.find((item) => item.policy === "signed");
    if (!signed) {
      signed = (await muxFetch(`/assets/${encodeURIComponent(row.assetId)}/playback-ids`, { method: "POST", body: JSON.stringify({ policy: "signed" }) }))?.data;
    }
    if (!signed?.id) throw new Error(`No signed playback ID was returned for asset ${row.assetId}`);

    if (row.playbackId !== signed.id) {
      await db.muxData.update({ where: { id: row.id }, data: { playbackId: signed.id } });
      changed += 1;
    }

    if (removePublic) {
      for (const playback of playbackIds.filter((item) => item.policy === "public")) {
        await muxFetch(`/assets/${encodeURIComponent(row.assetId)}/playback-ids/${encodeURIComponent(playback.id)}`, { method: "DELETE" });
      }
    }
  }

  console.log(`Mux signing migration complete. Assets checked: ${rows.length}; DB playback IDs updated: ${changed}; public playback removal: ${removePublic ? "enabled" : "disabled"}.`);
  if (!removePublic && rows.length) console.log("Public playback IDs were preserved. Run again with MUX_REMOVE_PUBLIC_PLAYBACK=1 only after signed playback has been verified in production.");
}

main().catch((error) => { console.error("Mux signing migration failed", error); process.exitCode = 1; }).finally(() => db.$disconnect());
