const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require("fs");
const path = require("path");                // ✅ ลืม import
const { execFile } = require("child_process"); // ✅ ใช้ execFile
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
router.use(express.json());                  // ✅ อ่าน JSON body

// TSPL ต้อง escape " เป็น "" (ไม่ใช่ \" )
const escapeTSPL = (s) => String(s ?? "").replace(/"/g, '""');

function buildTSPL(lines) {
  // lines = array ของข้อความทีละบรรทัด
  const mmW = 60, mmH = 60;  // ขนาดสติกเกอร์
  const x = 10;              // จุดเริ่ม X
  const y0 = 16;             // จุดเริ่ม Y
  const lineH = 28;          // ระยะห่างบรรทัด
  const font = "2";          // ฟอนต์ในเครื่อง (TSC 1..8)

  const body = lines
    .map((t, i) => `TEXT ${x},${y0 + i * lineH},"${font}",0,1,1,"${escapeTSPL(t)}"`)
    .join("\r\n");

  return [
    `SIZE ${mmW} mm, ${mmH} mm`,
    `GAP 2 mm, 0 mm`,
    `CLS`,
    body,
    `PRINT 1`,
    "" // ให้ลงท้าย \r\n
  ].join("\r\n");
}

/**
 * พิมพ์ข้อความ ASCII (อังกฤษ/ตัวเลข) ด้วยฟอนต์ในตัวเครื่อง
 */
function printDirect(text = "Hello", printerShareName = "GP") {
  return new Promise((resolve, reject) => {
    const tmp = path.join(
      __dirname,
      `label_${Date.now()}_${Math.random().toString(36).slice(2)}.prn`
    );

    const lines = String(text).split(/\r?\n/);
    const tspl = buildTSPL(lines);

    fs.writeFile(tmp, tspl, { encoding: "ascii" }, (wErr) => {
      if (wErr) return reject(wErr);

      // ใช้ copy /b ส่ง RAW ไปที่ชื่อแชร์ของเครื่องพิมพ์
      execFile(
        "cmd.exe",
        ["/c", "copy", "/b", tmp, `\\\\localhost\\${printerShareName}`],
        { windowsHide: true },
        (cpErr, _stdout, stderr) => {
          // ลบไฟล์ชั่วคราว ไม่ต้องรอ
          fs.unlink(tmp, () => {});
          if (cpErr) {
            const msg = (stderr || cpErr.message || "").trim();
            return reject(new Error(msg || "copy failed"));
          }
          resolve();
        }
      );
    });
  });
}

router.post("/print", async (req, res) => {
  try {
    const { text, printerShareName } = req.body || {};
    if (!text || !printerShareName) {
      return res.status(400).json({ error: "กรอก text และ printerShareName" });
    }

    await printDirect(text, printerShareName);
    res.json({ ok: true, message: "printed" });
  } catch (e) {
    console.error("Print Error:", e);
    res.status(500).json({ error: e.message || "เกิดข้อผิดพลาดในการพิมพ์" });
  }
});


module.exports = router;
