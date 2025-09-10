const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
const port = 3001;

app.use(cors({
  origin(origin, cb) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://dispensesystem-production.up.railway.app',
      'https://dispense-system.vercel.app/'
    ];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}));
app.use(express.json());


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

// TSPL ต้อง escape " เป็น "" (ไม่ใช่ \" )
const escapeTSPL = (s) => String(s ?? "").replace(/"/g, '""');

function buildTSPL(lines) {
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
    ""
  ].join("\r\n");
}

/**
 * @function printDirect
 * @desc Print ASCII text (English/numbers) using the printer's built-in font
 * @param {string} text - Text to print
 * @param {string} printerShareName - Printer share name
 * @returns {Promise<void>}
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

      execFile(
        "cmd.exe",
        ["/c", "copy", "/b", tmp, `\\\\localhost\\${printerShareName}`],
        { windowsHide: true },
        (cpErr, _stdout, stderr) => {
          fs.unlink(tmp, () => { });
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

/**
 * @route   POST /api/print
 * @desc    Print text to a specified printer
 * @access  Public
 */
app.post("/print", async (req, res) => {
  try {
    const { text, printerShareName } = req.body || {};
    console.log(text,printerShareName)
    if (!text || !printerShareName) {
      return res.status(400).json({ error: "กรอก text และ printerShareName" });
    }

    console.log(`Received POST request for print at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, req.body);

    await printDirect(text, printerShareName);
    res.status(200).json({ ok: true, message: "printed" });
  } catch (e) {
    console.error(`❌ Print Error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, e);
    res.status(500).json({ error: e.message || "เกิดข้อผิดพลาดในการพิมพ์" });
  }
});

/**
 * @route   GET /api/printers
 * @desc    Get list of available printers
 * @access  Public
 */
app.get("/printers", async (_req, res) => {
  try {
    console.log(`Received GET request for printers at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    const printers = await getPrinters();
    res.status(200).json(printers);
  } catch (err) {
    console.error(`❌ getPrinters error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
    res.status(500).json([]);
  }
});

app.listen(port, () => {
  console.log(`Printer agent running on http://localhost:${port}`);
});