import { getStore } from "@netlify/blobs";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function keyFor(code) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  const code = req.headers.get("x-sync-code") || "";
  if (code.length < 8 || code.length > 200) {
    return json({ error: "Sync code must be 8-200 characters" }, 400);
  }

  const store = getStore("packing-checklist");
  const key = await keyFor(code);

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    if (!data) return json({ exists: false });
    return json({ exists: true, updatedAt: data.updatedAt, state: data.state });
  }

  if (req.method === "PUT") {
    const text = await req.text();
    if (text.length > 500000) return json({ error: "Payload too large" }, 413);
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (!body || typeof body.updatedAt !== "number" || !body.state || !Array.isArray(body.state.trips)) {
      return json({ error: "Invalid payload" }, 400);
    }
    await store.setJSON(key, { updatedAt: body.updatedAt, state: body.state });
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/sync" };
