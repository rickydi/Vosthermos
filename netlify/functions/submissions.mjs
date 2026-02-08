import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("submissions");
  const method = req.method;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response("", { status: 204, headers });
  }

  // GET - Lire toutes les soumissions
  if (method === "GET") {
    const data = await store.get("all", { type: "json" });
    return new Response(JSON.stringify(data || []), { headers });
  }

  // POST - Ajouter une soumission
  if (method === "POST") {
    const body = await req.json();
    const data = (await store.get("all", { type: "json" })) || [];
    data.unshift({
      id: Date.now().toString(),
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      service: body.service || "",
      message: body.message || "",
      date: new Date().toISOString(),
      status: "new"
    });
    // Garder max 500 soumissions
    if (data.length > 500) data.length = 500;
    await store.setJSON("all", data);
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // PATCH - Changer le statut
  if (method === "PATCH") {
    const body = await req.json();
    const data = (await store.get("all", { type: "json" })) || [];
    const item = data.find(function(s) { return s.id === body.id; });
    if (item) {
      item.status = body.status;
      await store.setJSON("all", data);
    }
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // DELETE - Supprimer une soumission
  if (method === "DELETE") {
    const body = await req.json();
    let data = (await store.get("all", { type: "json" })) || [];
    data = data.filter(function(s) { return s.id !== body.id; });
    await store.setJSON("all", data);
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  return new Response("Method not allowed", { status: 405, headers });
};
