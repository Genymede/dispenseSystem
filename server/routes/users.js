const express = require("express");
const router = express.Router();
const pool = require("../db");
require("dotenv").config();

// ตั้งค่าการเชื่อมต่อฐานข้อมูล (ถ้ามี)
// pool.connect()
//   .then(client => {
//     console.log("Users database connected successfully!!");
//     client.release();
//   })
//   .catch(err => {
//     console.error("Failed to connect to Users database:", err.message);
//     process.exit(1);
//   });

// เนื่องจากเราจะใช้ localStorage ที่ฝั่ง Frontend, เราจึงไม่จำเป็นต้องใช้ express-session และ cookie-parser
// API นี้จะแค่ตรวจสอบการเข้าสู่ระบบและส่งข้อมูลผู้ใช้กลับไป

router.use(express.json());

router.get('/member', async (req, res) => {
  try {
    // แก้ไขคำสั่ง SQL เพื่อเลือกเฉพาะคอลัมน์ที่ต้องการ และ JOIN กับตาราง roles
    const sql = `
      SELECT
        u.uid,
        u.username,
        u.email,
        u.phone,
        r.role_name
      FROM
        users u
      JOIN
        roles r ON u.role_id = r.role_id
    `;
    
    // ดึงข้อมูลจากฐานข้อมูล
    const { rows } = await pool.query(sql);

    // ส่งข้อมูลผู้ใช้กลับไปเป็น JSON
    // rows จะเป็น Array ของ Object ที่ไม่มีคอลัมน์ password
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});


// ✅ API Login (ส่งข้อมูลผู้ใช้กลับไปให้ Frontend ไปจัดการใน localStorage เอง)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // สมมติว่า pool และ query เป็นตัวอย่างการเชื่อมต่อฐานข้อมูลของคุณ
    // ให้เปลี่ยนเป็นโค้ดการเชื่อมต่อฐานข้อมูลจริงของคุณ
    const result = await pool.query(
      `SELECT u.*, r.*
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.username = $1 AND u.password = $2`,
      [username, password]
    );
    console.log(result.rows[0])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ ส่งข้อมูลผู้ใช้กลับไปเป็น JSON โดยไม่มีการตั้งค่า cookie/session
    const user = { 
      id: result.rows[0].uid, 
      username: result.rows[0].username,
      role: {
        role_name: result.rows[0].role_name,
        role_name_th: result.rows[0].role_name_th,
        role_name_en: result.rows[0].role_name_en
      },
      // สามารถเพิ่มข้อมูลอื่นๆ ที่ต้องการเก็บได้
    };

    return res.json({ message: "เข้าสู่ระบบสำเร็จ", user });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Logout (ไม่จำเป็นต้องลบ cookie ที่ฝั่งเซิร์ฟเวอร์)
router.post("/logout", (req, res) => {
  // Frontend จะเป็นผู้รับผิดชอบในการลบข้อมูลจาก localStorage เอง
  return res.json({ message: "ออกจากระบบสำเร็จ" });
});



module.exports = router;
