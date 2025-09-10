const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

// src/app/api/print.js
export async function printLabel(text, printerShareName) {
  if (!text || !printerShareName) {
    throw new Error("กรุณากรอกข้อความและเลือกเครื่องพิมพ์");
  }
  const r = await fetch(`http://${host}:3001/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, printerShareName }),
  });

  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { error: raw }; }

  if (!r.ok || data?.error) {
    throw new Error(data?.error || `HTTP ${r.status}`);
  }
  return data;
}


export async function getPrinters() {
  const res = await fetch(`http://${host}:3001/printers`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}