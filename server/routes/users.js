// const express = require("express");
// const router = express.Router();
// const pool = require("../db");
// require("dotenv").config();

// // ตั้งค่าการเชื่อมต่อฐานข้อมูล (ถ้ามี)
// // pool.connect()
// //   .then(client => {
// //     console.log("Users database connected successfully!!");
// //     client.release();
// //   })
// //   .catch(err => {
// //     console.error("Failed to connect to Users database:", err.message);
// //     process.exit(1);
// //   });

// // เนื่องจากเราจะใช้ localStorage ที่ฝั่ง Frontend, เราจึงไม่จำเป็นต้องใช้ express-session และ cookie-parser
// // API นี้จะแค่ตรวจสอบการเข้าสู่ระบบและส่งข้อมูลผู้ใช้กลับไป

// router.use(express.json());

// router.get('/member', async (req, res) => {
//   try {
//     // แก้ไขคำสั่ง SQL เพื่อเลือกเฉพาะคอลัมน์ที่ต้องการ และ JOIN กับตาราง roles
//     const sql = `
//       SELECT
//         u.uid,
//         u.username,
//         u.email,
//         u.phone,
//         r.role_name
//       FROM
//         users u
//       JOIN
//         roles r ON u.role_id = r.role_id
//     `;
    
//     // ดึงข้อมูลจากฐานข้อมูล
//     const { rows } = await pool.query(sql);

//     // ส่งข้อมูลผู้ใช้กลับไปเป็น JSON
//     // rows จะเป็น Array ของ Object ที่ไม่มีคอลัมน์ password
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
//   }
// });


// // ✅ API Login (ส่งข้อมูลผู้ใช้กลับไปให้ Frontend ไปจัดการใน localStorage เอง)
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // สมมติว่า pool และ query เป็นตัวอย่างการเชื่อมต่อฐานข้อมูลของคุณ
//     // ให้เปลี่ยนเป็นโค้ดการเชื่อมต่อฐานข้อมูลจริงของคุณ
//     const result = await pool.query(
//       `SELECT u.*, r.*
//       FROM users u
//       JOIN roles r ON u.role_id = r.role_id
//       WHERE u.username = $1 AND u.password = $2`,
//       [username, password]
//     );
//     console.log(result.rows[0])

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
//     }

//     // ✅ ส่งข้อมูลผู้ใช้กลับไปเป็น JSON โดยไม่มีการตั้งค่า cookie/session
//     const user = { 
//       id: result.rows[0].uid, 
//       username: result.rows[0].username,
//       role: {
//         role_name: result.rows[0].role_name,
//         role_name_th: result.rows[0].role_name_th,
//         role_name_en: result.rows[0].role_name_en
//       },
//       // สามารถเพิ่มข้อมูลอื่นๆ ที่ต้องการเก็บได้
//     };

//     return res.json({ message: "เข้าสู่ระบบสำเร็จ", user });
    
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ API Logout (ไม่จำเป็นต้องลบ cookie ที่ฝั่งเซิร์ฟเวอร์)
// router.post("/logout", (req, res) => {
//   // Frontend จะเป็นผู้รับผิดชอบในการลบข้อมูลจาก localStorage เอง
//   return res.json({ message: "ออกจากระบบสำเร็จ" });
// });



// module.exports = router;


// const express = require("express");
// require("dotenv").config();

// module.exports = (pool) => {
//   const router = express.Router();
//   router.use(express.json());

//   // ตั้งค่าการเชื่อมต่อฐานข้อมูล
//   pool.connect()
//     .then(client => {
//       console.log(`Users database connected successfully at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
//       client.release();
//     })
//     .catch(err => {
//       console.error(`❌ Failed to connect to Users database at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err.message);
//       process.exit(1);
//     });

//   /**
//    * @route   GET /api/member
//    * @desc    Get all users with their roles
//    * @access  Public
//    */
//   router.get('/member', async (req, res) => {
//     try {
//       console.log(`Received GET request for all members at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
//       const sql = `
//         SELECT
//           u.uid,
//           u.username,
//           u.email,
//           u.phone,
//           r.role_name
//         FROM
//           med.users u
//         JOIN
//           med.roles r ON u.role_id = r.role_id
//       `;
      
//       const { rows } = await pool.query(sql);
//       res.status(200).json(rows);
//     } catch (err) {
//       console.error(`❌ Error fetching members at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
//       res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
//     }
//   });

//   /**
//    * @route   POST /api/login
//    * @desc    Authenticate user and return user data
//    * @access  Public
//    */
//   router.post("/login", async (req, res) => {
//     const { username, password } = req.body;

//     try {
//       console.log(`Received POST request for login at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, { username });
//       const result = await pool.query(
//         `SELECT u.*, r.*
//         FROM med.users u
//         JOIN med.roles r ON u.role_id = r.role_id
//         WHERE u.username = $1 AND u.password = $2`,
//         [username, password]
//       );

//       if (result.rows.length === 0) {
//         return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
//       }

//       const user = { 
//         id: result.rows[0].uid, 
//         username: result.rows[0].username,
//         role: {
//           role_name: result.rows[0].role_name,
//           role_name_th: result.rows[0].role_name_th,
//           role_name_en: result.rows[0].role_name_en
//         }
//       };

//       res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", user });
//     } catch (err) {
//       console.error(`❌ Error during login at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
//       res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
//     }
//   });

//   /**
//    * @route   POST /api/logout
//    * @desc    Log out user (client-side localStorage cleanup)
//    * @access  Public
//    */
//   router.post("/logout", (req, res) => {
//     console.log(`Received POST request for logout at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
//     res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
//   });

//   return router;
// };

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (pool) => {
  const router = express.Router();

  // Middleware to parse JSON body for all requests
  router.use(express.json());

  // Check database connection status on startup
  pool.connect()
    .then(client => {
      console.log(`Users database connected successfully at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      client.release();
    })
    .catch(err => {
      console.error(`❌ Failed to connect to Users database at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err.message);
      process.exit(1);
    });

  // GET user by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Fetching user with ID:", id);

    try {
      // Use 'await' to wait for the database query result
      const result = await pool.query(`SELECT * FROM "Admin".users WHERE user_id = $1`, [id]);
      
      if (result.rows.length === 0) {
        // If no user is found, return a 404 Not Found error
        return res.status(404).json({ error: "ไม่พบผู้ใช้" });
      }

      // Return the first user found
      return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
      console.error(`❌ Error during user fetch at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการเรียกข้อมูลผู้ใช้" });
    }
  });

  // POST login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      console.log(`Received POST request for login at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, { username }, {password});
      const result = await pool.query(
        `SELECT * FROM "Admin".users WHERE username = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }

      const user = result.rows[0];
      // bcrypt.compare will return a boolean, so the check `!isMatch` is correct
      const isMatch = await bcrypt.compare(password, user.password);
      //console.log("raw password: ",password,"\nuser password: ",user.password,"\nis match:",isMatch)

      if (!isMatch) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }

      // Create JWT token
      const token = jwt.sign(
        { uid: user.uid, username: user.username, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log(`Login successful for user: ${username}`);
      res.status(200).json({ 
        message: "เข้าสู่ระบบสำเร็จ", 
        token: token,
        user
      });
    } catch (err) {
      console.error(`❌ Error during login at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
  });

  // POST logout
  router.post("/logout", (req, res) => {
    console.log(`Received POST request for logout at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
  });

  return router;
};