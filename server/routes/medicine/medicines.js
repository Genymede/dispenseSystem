// const express = require("express");
// const router = express.Router();
// const pool = require("../../db"); // ✅ เรียก pool มาใช้ตรง ๆ
// const { URL } = require("url");
// const cors = require("cors");

// // Middleware for CORS
// router.use(cors({
//   origin: (origin, callback) => {
//     // อนุญาตคำขอที่ไม่มี origin (เช่น คำขอจาก Postman)
//     if (!origin) return callback(null, true);
//     // ใช้ URL API เพื่อ parse origin และตรวจสอบพอร์ต
//     try {
//       const url = new URL(origin);
//       if (url.port === '3000') {
//         callback(null, true); // อนุญาต
//       } else {
//         callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาต
//       }
//     } catch (e) {
//       callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาตหาก URL ไม่ถูกต้อง
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type'], // อนุญาต Content-Type ซึ่งจำเป็นสำหรับคำขอ POST และ PATCH
// }));



// // เรียกใช้ sub-modules
// const medUsageRouter = require("./medUsage");
// const radRouter = require("./rad");
// const overdueRouter = require("./overdue");
// const allergyRouter = require("./allergy");
// const orderHistoryRouter = require("./orderHistory");
// const stockHistoryRouter = require("./stockHistory"); // ✅ เรียกใช้ stockHistoryRouter ถ้ามี
// const interactionsRouter = require("./interactions");
// const problemRouter = require("./problem"); // ✅ เรียกใช้ interactionsRouter ถ้ามี
// const medCutOff = require("./medCutOff"); // ✅ เรียกใช้ medCutOff ถ้ามี
// const medError = require("./medError")
// const medRequestRouter = require("./medRequest"); // ✅ เรียกใช้ medRequestRouter ถ้ามี
// const subwarehouseRouter = require("./subwarehouse"); // ✅ เรียกใช้ subwarehouseRouter ถ้ามี

// // รวม router ย่อย
// router.use(medUsageRouter);
// router.use(radRouter);
// router.use(overdueRouter);
// router.use(allergyRouter);
// router.use(orderHistoryRouter);
// router.use(stockHistoryRouter);
// router.use(interactionsRouter);
// router.use(problemRouter);
// router.use(medCutOff);
// router.use(medError);
// router.use(medRequestRouter);
// router.use(subwarehouseRouter);

// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("SELECT * FROM med_table WHERE med_id = $1", [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Medicine not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params
//     const {
//       med_name,
//       med_generic_name,
//       med_severity,
//       med_counting_t,
//       med_marketing,
//       med_thai_name,
//       med_cost_price,
//       med_selling_prix,
//       med_medium_p,
//       med_dosage_fo,
//       med_medical_c,
//       med_essential_t,
//       med_out_of_sto ,
//       med_replaceme,
//       med_TMT_GP_n,
//       med_TMT_TP_n,
//       med_dose_dialc,
//       med_TMT_code,
//       med_TPU_code,
//       med_pregnancy,
//       med_set_new_p ,
//       mde_dispence_l,
//       med_mfg,
//       med_exp
//     } = req.body;

//     // ตรวจสอบฟิลด์ที่จำเป็น
//     if (!med_name) {
//       return res.status(400).json({ error: "ชื่อยาต้องไม่ว่างเปล่า" });
//     }

//     const result = await pool.query(
//       `UPDATE med_table SET 
//             med_name = $1,
//             med_generic_name = $2,
//             med_severity = $3,
//             med_counting_unit = $4,
//             med_marketing_name = $5,
//             med_thai_name = $6,
//             med_cost_price = $7,
//             med_selling_price = $8,
//             med_medium_price = $9,
//             med_dosage_form = $10,
//             med_medical_category = $11,
//             med_essential_med_list = $12,
//             med_out_of_stock = $13,
//             med_replacement = $14,
//             "med_TMT_GP_name" = $15,
//             "med_TMT_TP_name" = $16,
//             med_dose_dialogue = $17,
//             "med_TMT_code" = $18,
//             "med_TPU_code" = $19,
//             med_pregnancy_cagetory = $20,
//             med_set_new_price = $21,
//             "mde_dispence_IPD_freq" = $22,
//             med_mfg = $23,
//             med_exp = $24
//         WHERE 
//             med_id = $25  
//         RETURNING *;`,
//       [
//         med_name,
//         med_generic_name,
//         med_severity,
//         med_counting_t,
//         med_marketing,
//         med_thai_name,
//         med_cost_price,
//         med_selling_prix,
//         med_medium_p,
//         med_dosage_fo,
//         med_medical_c,
//         med_essential_t,
//         med_out_of_sto,
//         med_replaceme,
//         med_TMT_GP_n,
//         med_TMT_TP_n,
//         med_dose_dialc,
//         med_TMT_code,
//         med_TPU_code,
//         med_pregnancy,
//         med_set_new_p,
//         mde_dispence_l,
//         med_mfg,
//         med_exp,
//         id
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error updating medicine:", err);
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลยา" });
//   }
// });

// // ลบข้อมูล
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("DELETE FROM med_table WHERE med_id = $1 RETURNING *", [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Medicine not found" });
//     }
//     res.json({ message: "Medicine deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // เพิ่มข้อมูลยา
// router.post("/", async (req, res) => {
//   try {
//     const {
//       med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
//       med_thai_name, med_cost_price = 0, med_selling_price = 0, med_medium_price = 0,
//       med_dosage_form, med_medical_category, med_essential_med_list, med_out_of_stock = false,
//       med_replacement, med_TMT_GP_name, med_TMT_TP_name,
//       med_dose_dialogue, med_TMT_code, med_TPU_code, med_pregnancy_cagetory,
//       med_set_new_price = false, mde_dispence_IPD_freq = 0, med_mfg, med_exp
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO med_table (
//         med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
//         med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form,
//         med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement,
//         "med_TMT_GP_name", "med_TMT_TP_name", med_dose_dialogue,
//         "med_TMT_code", "med_TPU_code", med_pregnancy_cagetory, med_set_new_price,
//         "mde_dispence_IPD_freq", med_mfg, med_exp
//       ) VALUES (
//         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
//         $11,$12,$13,$14,$15,$16,$17,$18,
//         $19,$20,$21,$22,$23,$24
//       ) RETURNING *`,
//       [
//         med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
//         med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form,
//         med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement,
//         med_TMT_GP_name, med_TMT_TP_name, med_dose_dialogue,
//         med_TMT_code, med_TPU_code, med_pregnancy_cagetory, med_set_new_price,
//         mde_dispence_IPD_freq, med_mfg, med_exp
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // อ่านข้อมูลยา
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM med_table ORDER BY med_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
const express = require("express");
const { URL } = require("url");
const cors = require("cors");


// เปลี่ยน module.exports ให้เป็นฟังก์ชันที่รับ 'pool'
module.exports = (pool) => {
  const router = express.Router();
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dispensesystem-production.up.railway.app', // เพิ่ม origin ของ production ถ้าต้องใช้
    'https://dispense-system.vercel.app'
  ];
// Middleware for CORS
  router.use(cors({
    origin: (origin, callback) => {
      // อนุญาตคำขอที่ไม่มี origin (เช่น Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('ไม่อนุญาตโดย CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }));

  // สำคัญ: handle preflight
  router.options('*', cors());
  
  // เรียกใช้ sub-modules
  // ต้องส่ง pool เข้าไปในทุก sub-module ด้วย
  const medUsageRouter = require("./medUsage")(pool);
  const radRouter = require("./rad")(pool);
  const overdueRouter = require("./overdue")(pool);
  const allergyRouter = require("./allergy")(pool);
  const orderHistoryRouter = require("./orderHistory")(pool);
  const stockHistoryRouter = require("./stockHistory")(pool);
  const interactionsRouter = require("./interactions")(pool);
  const problemRouter = require("./problem")(pool);
  const medCutOff = require("./medCutOff")(pool);
  const medError = require("./medError")(pool);
  const medRequestRouter = require("./medRequest")(pool);
  const subwarehouseRouter = require("./subwarehouse")(pool);
  const expireMedRouter = require("./expireMed")(pool);
  
  // รวม router ย่อย
  router.use(medUsageRouter);
  router.use(radRouter);
  router.use(overdueRouter);
  router.use(allergyRouter);
  router.use(orderHistoryRouter);
  router.use(stockHistoryRouter);
  router.use(interactionsRouter);
  router.use(problemRouter);
  router.use(medCutOff);
  router.use(medError);
  router.use(medRequestRouter);
  router.use(subwarehouseRouter);
  router.use(expireMedRouter);

  
  
  // อัปเดตข้อมูลยา
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params
      const {
        med_name,
        med_generic_name,
        med_severity,
        med_counting_t,
        med_marketing,
        med_thai_name,
        med_cost_price,
        med_selling_prix,
        med_medium_p,
        med_dosage_fo,
        med_medical_c,
        med_essential_t,
        med_out_of_sto ,
        med_replaceme,
        med_TMT_GP_n,
        med_TMT_TP_n,
        med_quantity,
        med_dose_dialc,
        med_TMT_code,
        med_TPU_code,
        med_pregnancy,
        med_set_new_p,
        mde_dispence_l,
        med_mfg,
        med_exp
      } = req.body;
  
      // ตรวจสอบฟิลด์ที่จำเป็น
      if (!med_name) {
        return res.status(400).json({ error: "ชื่อยาต้องไม่ว่างเปล่า" });
      }
  
      const result = await pool.query(
        `UPDATE med.med_table SET 
              med_name = $1,
              med_generic_name = $2,
              med_severity = $3,
              med_counting_unit = $4,
              med_marketing_name = $5,
              med_thai_name = $6,
              med_cost_price = $7,
              med_selling_price = $8,
              med_medium_price = $9,
              med_dosage_form = $10,
              med_medical_category = $11,
              med_essential_med_list = $12,
              med_out_of_stock = $13,
              med_replacement = $14,
              "med_TMT_GP_name" = $15,
              "med_TMT_TP_name" = $16,
              med_quantity = $17,
              med_dose_dialogue = $18,
              "med_TMT_code" = $19,
              "med_TPU_code" = $20,
              med_pregnancy_cagetory = $21,
              med_set_new_price = $22,
              "mde_dispence_IPD_freq" = $23,
              med_mfg = $24,
              med_exp = $25
          WHERE 
              med_id = $26
          RETURNING *;`,
        [
          med_name,
          med_generic_name,
          med_severity,
          med_counting_t,
          med_marketing,
          med_thai_name,
          med_cost_price,
          med_selling_prix,
          med_medium_p,
          med_dosage_fo,
          med_medical_c,
          med_essential_t,
          med_out_of_sto,
          med_replaceme,
          med_TMT_GP_n,
          med_TMT_TP_n,
          med_quantity,
          med_dose_dialc,
          med_TMT_code,
          med_TPU_code,
          med_pregnancy,
          med_set_new_p,
          mde_dispence_l,
          med_mfg,
          med_exp,
          id
        ]
      );
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error updating medicine:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลยา" });
    }
  });
  
  // ลบข้อมูลยา
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM med.med_table WHERE med_id = $1 RETURNING *", [id]); // แก้ไขตรงนี้
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json({ message: "Medicine deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // เพิ่มข้อมูลยา
  router.post("/", async (req, res) => {
    try {
      const {
        med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
        med_thai_name, med_cost_price = 0, med_selling_price = 0, med_medium_price = 0,
        med_dosage_form, med_medical_category, med_essential_med_list, med_out_of_stock = false,
        med_replacement, med_TMT_GP_name, med_TMT_TP_name, med_quantity = 0,
        med_dose_dialogue, med_TMT_code, med_TPU_code, med_pregnancy_cagetory,
        med_set_new_price = false, mde_dispence_IPD_freq = 0, med_mfg, med_exp
      } = req.body;
  
      const result = await pool.query(
        `INSERT INTO med.med_table ( // แก้ไขตรงนี้
          med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
          med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form,
          med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement,
          "med_TMT_GP_name", "med_TMT_TP_name", med_quantity, med_dose_dialogue,
          "med_TMT_code", "med_TPU_code", med_pregnancy_cagetory, med_set_new_price,
          "mde_dispence_IPD_freq", med_mfg, med_exp
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,
          $19,$20,$21,$22,$23,$24,$25
        ) RETURNING *`,
        [
          med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name,
          med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form,
          med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement,
          med_TMT_GP_name, med_TMT_TP_name, med_quantity, med_dose_dialogue,
          med_TMT_code, med_TPU_code, med_pregnancy_cagetory, med_set_new_price,
          mde_dispence_IPD_freq, med_mfg, med_exp
        ]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error adding medicine:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // อ่านข้อมูลยาทั้งหมด
  router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.med_table ORDER BY med_id DESC"); // แก้ไขตรงนี้
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "ayyyyyyyyyyyy" + err.message });
    }
  });

  // เรียกดูข้อมูลยาตาม ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM med.med_table WHERE med_id = $1", [id]); // แก้ไขตรงนี้
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  return router;
};
