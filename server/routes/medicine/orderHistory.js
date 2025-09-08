// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// router.get("/orderHistory", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM med_order_history ORDER BY time DESC");
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Database error:", err);
//     res.status(500).json({ error: "Database query failed" });
//   }
// });

// router.post("/orderHistory", async (req, res) => {
//   const { patient_id, dispense_doc_id, doctor_id, description, medicines } = req.body;

//   if (!medicines || medicines.length === 0) {
//     return res.status(400).json({ error: "ไม่มีรายการยา" });
//   }

//   try {
//     const query = `
//       INSERT INTO med_order_history (time, patient_id, dispense_doc_id, doctor_id, description, medicines)
//       VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING *`;
//     const values = [patient_id, dispense_doc_id, doctor_id, description, JSON.stringify(medicines)];
//     const result = await pool.query(query, values);

//     res.json({ success: true, inserted: result.rows[0] });
//   } catch (err) {
//     console.error("Database error:", err);
//     res.status(500).json({ error: "Database insert failed" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/orderHistory", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.med_order_history ORDER BY time DESC");
      res.json(result.rows);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  router.post("/orderHistory", async (req, res) => {
    const { patient_id, dispense_doc_id, doctor_id, description, medicines } = req.body;

    console.log("res order history",patient_id, dispense_doc_id, doctor_id, description, medicines)

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ error: "ไม่มีรายการยา" });
    }

    try {
      const query = `
        INSERT INTO med.med_order_history (time, patient_id, dispense_doc_id, doctor_id, description, medicines, created_at, updated_at)
        VALUES (NOW(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`;
      const values = [patient_id, dispense_doc_id, doctor_id, description, JSON.stringify(medicines)];
      const result = await pool.query(query, values);
      
      res.json({ success: true, inserted: result.rows[0] });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database insert failed" });
    }
  });

  return router;
};