const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
// 💊 medicines.js
export async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  return res.json();
}

export async function getMedicineById(med_id) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/${med_id}`);
  return res.json();
}