const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

export async function recordStockChange(data) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock_history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function recordOverdue(data) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}