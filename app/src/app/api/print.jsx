// src/app/api/print.js

const LOCAL_AGENT_BASE = 'http://127.0.0.1:3001';   // ชี้ตรงไปยังเครื่องตัวเองเสมอ

export async function printLabel(text, printerShareName) {
  if (!text || !printerShareName) {
    throw new Error("กรุณากรอกข้อความและเลือกเครื่องพิมพ์");
  }
  const r = await fetch(`${LOCAL_AGENT_BASE}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, printerShareName }),
  });

  const raw = await r.text();
  let data; try { data = JSON.parse(raw); } catch { data = { error: raw }; }

  if (!r.ok || data?.error) {
    throw new Error(data?.error || `HTTP ${r.status}`);
  }
  return data;
}

export async function getPrinters() {
  const res = await fetch(`${LOCAL_AGENT_BASE}/printers`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

// (ตัวเลือก) ฟังก์ชันเช็คว่า agent ทำงานอยู่ไหม
export async function pingAgent(timeoutMs = 800) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${LOCAL_AGENT_BASE}/printers`, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch {
    clearTimeout(t);
    return false;
  }
}
