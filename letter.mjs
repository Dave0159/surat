import { getStore } from "@netlify/blobs";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const ID_RE = /^[a-z0-9]{4,12}$/;
const MAX_BYTES = 20000;

const newId = (len = 6) => {
  const b = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("");
};

export default async (req) => {
  const store = getStore("letters");

  if (req.method === "POST") {
    const body = await req.text();
    if (!body || body.length > MAX_BYTES) {
      return new Response("Ukuran surat tidak valid", { status: 400 });
    }
    let id = newId();
    for (let i = 0; i < 5 && (await store.get(id)) !== null; i++) id = newId(6 + i);
    await store.set(id, body);
    return Response.json({ id });
  }

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!ID_RE.test(id)) return new Response("ID tidak valid", { status: 400 });
    const data = await store.get(id);
    if (data === null) return new Response("Tidak ditemukan", { status: 404 });
    return new Response(data, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/letter" };
