const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

export async function createOrderHistory(order) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/order-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.json();
}


function getLocalISOString() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60000; // offset เป็น milliseconds
  const localTime = new Date(now.getTime() - timezoneOffsetMs);
  return localTime.toISOString().slice(0, 19); // ตัดแค่ถึงวินาที
}


// ➡️ ฟังก์ชันสร้างข้อมูลในตาราง med_usage
export async function createMedUsage(patientId, med) {
  try {
    await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_usage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        med_id: med.med_id,
        start_datetime: getLocalISOString(),
        dosage: med.med_dose_dialogue || "-",  // ถ้าไม่มีให้ใส่ "-" กัน null
        frequency: med.mde_dispence_IPD_freq ? `วันละ ${med.mde_dispence_IPD_freq} ครั้ง` : "ไม่ระบุ",  // ดึงจากจำนวน IPD freq
        route: med.med_dosage_form || "ไม่ระบุ",  // รูปแบบการใช้ยา เช่น "Oral", "Injection"
        usage_status: "Active",  // ใช้ Active เป็นค่า default เว้นแต่คุณอยากให้เลือกเอง
      }),
    });
  } catch (error) {
    console.error("Error creating med usage:", error);
  }
}