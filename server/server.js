// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const http = require('http');

// const app = express();
// const port = 3001;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// const server = http.createServer(app);

// const medicineRoutes = require("./routes/medicine/medicines");
// const userRoutes = require("./routes/users");
// const patientRoutes = require("./routes/patient/patients");
// const reportsRoutes = require("./routes/reports");
// const printerRoutes = require("./routes/printer");
// const prtportRoutes = require("./routes/prtport");
// const notiRoutes = require("./routes/noti/notifications");
// const settingsRoutes = require("./routes/settings");

// app.use("/medicine", medicineRoutes);
// app.use("/user", userRoutes);
// app.use("/patient", patientRoutes);
// app.use("/reports", reportsRoutes);
// app.use("/printer", printerRoutes);
// app.use("/prtport", prtportRoutes);
// app.use("/noti", notiRoutes.router);
// app.use("/settings", settingsRoutes);

// notiRoutes.setupWebSocket(server);

// server.listen(port, '0.0.0.0', () => {
//   console.log(`Server is running on http://localhost:${port} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
// });

// server.on('error', (error) => {
//   console.error(`❌ Server error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require('http');

// นำเข้า (import) pool จากไฟล์ db.js ที่เราได้แก้ไขไปแล้ว
const pool = require("./db.js");

const app = express();
const port = 3001;

// ลบโค้ดการเชื่อมต่อฐานข้อมูลและตั้งค่า search_path ออกจากไฟล์นี้
// เนื่องจากกระบวนการนี้ได้ถูกย้ายไปจัดการใน db.js แล้ว

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  credentials: true
}));

const server = http.createServer(app);

// ส่ง pool ที่ถูกนำเข้า (imported pool) ไปยัง route handlers
const medicineRoutes = require("./routes/medicine/medicines")(pool);
const patientRoutes = require("./routes/patient/patients")(pool);
const userRoutes = require("./routes/users")(pool);
const printerRoutes = require("./routes/printer")(pool);
const reportsRoutes = require("./routes/reports")(pool);
const prtportRoutes = require("./routes/prtport")(pool);
const notiRoutes = require("./routes/noti/notifications")(pool);
const settingsRoutes = require("./routes/settings")(pool);


app.use("/medicine", medicineRoutes);
app.use("/patient", patientRoutes);
app.use("/user", userRoutes);
app.use("/reports", reportsRoutes);
app.use("/printer", printerRoutes);
app.use("/prtport", prtportRoutes);
app.use("/noti", notiRoutes.router);
app.use("/settings", settingsRoutes);

notiRoutes.setupWebSocket(server);


server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
});

server.on('error', (error) => {
  console.error(`❌ Server error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
});