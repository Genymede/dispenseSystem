import { jsPDF } from "jspdf";

// ฟังก์ชันแปลง TTF เป็นฟอนต์ของ jsPDF
export async function loadSarabunFont(doc) {
  const fontUrl = "/fonts/ThaiSarabun/subset-Sarabun-Regular.ttf";
  const fontData = await fetch(fontUrl).then(res => res.arrayBuffer());

  doc.addFileToVFS("Sarabun.ttf", fontData);
  doc.addFont("Sarabun.ttf", "Sarabun", "normal");
}
