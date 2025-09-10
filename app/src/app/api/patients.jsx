// This file contains functions to interact with the patient API endpoints.

const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
// 🩺 patients.js
export async function getPatients() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
  return res.json();
}

export async function getPatientById(id) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/${id}`);
  return res.json();
}