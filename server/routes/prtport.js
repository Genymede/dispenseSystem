// const express = require("express");
// const router = express.Router();
// const cors = require("cors");
// const { execFile } = require("child_process");
// const path = require("path");
// const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
// router.use(cors({ origin: `http://${host}:3000`, credentials: true }));
// router.use(express.json());

// // ฟังก์ชันสำหรับรันคำสั่ง PowerShell
// function runPS(command) {
//   const pwsh = path.join(
//     process.env.windir,
//     "System32",
//     "WindowsPowerShell",
//     "v1.0",
//     "powershell.exe"
//   );

//   const args = [
//     "-NoProfile",
//     "-NonInteractive",
//     "-ExecutionPolicy",
//     "Bypass",
//     "-Command",
//     // บังคับ UTF-8 + เงียบ error message จุกจิก
//     "[Console]::OutputEncoding=[Text.Encoding]::UTF8; " +
//       "$ErrorActionPreference='SilentlyContinue'; " +
//       command,
//   ];

//   return new Promise((resolve, reject) => {
//     execFile(
//       pwsh,
//       args,
//       { windowsHide: true, maxBuffer: 1024 * 1024 },
//       (err, stdout, stderr) => {
//         if (err) return reject(new Error(stderr || err.message));
//         resolve(stdout.toString());
//       }
//     );
//   });
// }

// // ฟังก์ชันสำหรับดึงรายชื่อเครื่องพิมพ์
// async function getPrinters() {
//   const ps = `
//     $printers = Get-Printer | Select-Object Name, DriverName, PortName, ShareName, PrinterStatus;
//     $ports = Get-PrinterPort | Select-Object Name, PortMonitor, PrinterHostAddress, Description;

//     $map = @{};
//     foreach ($p in $ports) { $map[$p.Name] = $p }

//     $out = foreach ($pr in $printers) {
//       $port = $map[$pr.PortName];
//       [PSCustomObject]@{
//         Name = $pr.Name;
//         DriverName = $pr.DriverName;
//         PortName = $pr.PortName;
//         ShareName = $pr.ShareName;
//         PrinterStatus = $pr.PrinterStatus;
//         Port = if ($port) {
//           [PSCustomObject]@{
//             Name = $port.Name;
//             PortMonitor = $port.PortMonitor;
//             HostAddress = $port.PrinterHostAddress;
//             Description = $port.Description;
//           }
//         } else { $null }
//       }
//     }
    
//     # หาก $out มีมากกว่า 1 object จะเป็น array, หากมี 1 object จะเป็น object เดี่ยว
//     # ใช้ @($out) เพื่อบังคับให้เป็น array เสมอ
//     # จากนั้นแปลงเป็น JSON
//     @($out) | ConvertTo-Json -Depth 5 -Compress;
//   `;

//   const raw = await runPS(ps);
  
//   // ✅ แก้ไขส่วนการ parse JSON เพื่อรองรับการส่งค่ากลับเป็น Array หรือ Object
//   const trimmed = raw.trim();
//   if (!trimmed) {
//     return []; // คืนค่า array ว่างถ้าไม่มีข้อมูล
//   }
  
//   try {
//     const data = JSON.parse(trimmed);
//     return Array.isArray(data) ? data : [data];
//   } catch (parseError) {
//     console.error("Error parsing JSON from PowerShell:", parseError, "Raw output:", trimmed);
//     return []; // คืนค่า array ว่างเมื่อเกิดข้อผิดพลาดในการ parse
//   }
// }

// // API endpoint สำหรับดึงรายชื่อเครื่องพิมพ์
// router.get("/printers", async (_req, res) => {
//   try {
//     const printers = await getPrinters();
//     // ✅ ส่งข้อมูลกลับเป็น Array เสมอ เพื่อให้โค้ดฝั่ง Client ไม่ error
//     res.json(printers);
//   } catch (err) {
//     console.error("getPrinters error:", err);
//     // ส่ง Array ว่างกลับเมื่อเกิดข้อผิดพลาด
//     res.status(500).json([]);
//   }
// });

// module.exports = router;

const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");
const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

module.exports = () => {
  const router = express.Router();
  const allowed = [
  'http://localhost:3000',    // Next/Vite dev
  'http://localhost:5173',
  'https://dispensesystem-production.up.railway.app', // ถ้าต้องเรียกตัวเอง
  // ใส่โดเมนจริงของ frontend เมื่อ deploy
];
  router.use(cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Cache-Control'],
  }));
  router.use(express.json());

  /**
   * @function runPS
   * @desc Run a PowerShell command
   * @param {string} command - PowerShell command to execute
   * @returns {Promise<string>} - Command output
   */
  function runPS(command) {
    const pwsh = path.join(
      process.env.windir,
      "System32",
      "WindowsPowerShell",
      "v1.0",
      "powershell.exe"
    );

    const args = [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      "[Console]::OutputEncoding=[Text.Encoding]::UTF8; " +
        "$ErrorActionPreference='SilentlyContinue'; " +
        command,
    ];

    return new Promise((resolve, reject) => {
      execFile(
        pwsh,
        args,
        { windowsHide: true, maxBuffer: 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message));
          resolve(stdout.toString());
        }
      );
    });
  }

  /**
   * @function getPrinters
   * @desc Retrieve list of printers using PowerShell
   * @returns {Promise<Array>} - Array of printer objects
   */
  async function getPrinters() {
    const ps = `
      $printers = Get-Printer | Select-Object Name, DriverName, PortName, ShareName, PrinterStatus;
      $ports = Get-PrinterPort | Select-Object Name, PortMonitor, PrinterHostAddress, Description;

      $map = @{};
      foreach ($p in $ports) { $map[$p.Name] = $p }

      $out = foreach ($pr in $printers) {
        $port = $map[$pr.PortName];
        [PSCustomObject]@{
          Name = $pr.Name;
          DriverName = $pr.DriverName;
          PortName = $pr.PortName;
          ShareName = $pr.ShareName;
          PrinterStatus = $pr.PrinterStatus;
          Port = if ($port) {
            [PSCustomObject]@{
              Name = $port.Name;
              PortMonitor = $port.PortMonitor;
              HostAddress = $port.PrinterHostAddress;
              Description = $port.Description;
            }
          } else { $null }
        }
      }
      
      @($out) | ConvertTo-Json -Depth 5 -Compress;
    `;

    const raw = await runPS(ps);
    const trimmed = raw.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const data = JSON.parse(trimmed);
      return Array.isArray(data) ? data : [data];
    } catch (parseError) {
      console.error(`❌ Error parsing JSON from PowerShell at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, parseError, "Raw output:", trimmed);
      return [];
    }
  }

  /**
   * @route   GET /api/printers
   * @desc    Get list of available printers
   * @access  Public
   */
  router.get("/printers", async (_req, res) => {
    try {
      console.log(`Received GET request for printers at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      const printers = await getPrinters();
      res.status(200).json(printers);
    } catch (err) {
      console.error(`❌ getPrinters error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json([]);
    }
  });

  return router;
};