// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// router.get("/overdue", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM overdue_med ORDER BY time DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/overdue", async (req, res) => {
//   try {
//     const { med_id,med_sid, dispense_status, patient_id, quantity } = req.body;
//     console.log(med_id,med_sid, dispense_status, patient_id, quantity);

//     // Validate required fields
//     if (!med_id || !patient_id) {
//       return res.status(400).json({ error: "med_id and patient_id are required." });
//     }

//     const result = await pool.query(
//       `INSERT INTO overdue_med (med_id, med_sid, time,dispense_status, patient_id, quantity)
//        VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING *`,
//       [med_id,med_sid, dispense_status, patient_id,quantity]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error adding overdue medication:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/overdue/:id", async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
//   try {
//     const result = await pool.query(
//       "UPDATE overdue_med SET dispense_status = $1 WHERE overdue_id = $2 RETURNING *",
//       [status, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete("/overdue/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query("DELETE FROM overdue_med WHERE overdue_id = $1", [id]);
//     res.json({ message: "ลบสำเร็จ" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/overdue", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.overdue_med ORDER BY time DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/overdue", async (req, res) => {
    try {
      const { med_id, med_sid, dispense_status, patient_id, quantity } = req.body;
      console.log(med_id, med_sid, dispense_status, patient_id, quantity);

      // Validate required fields
      if (!med_id || !patient_id) {
        return res.status(400).json({ error: "med_id and patient_id are required." });
      }

      const result = await pool.query(
        `INSERT INTO med.overdue_med (med_id, med_sid, time, dispense_status, patient_id, quantity)
         VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING *`,
        [med_id, med_sid, dispense_status, patient_id, quantity]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error adding overdue medication:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/overdue/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const result = await pool.query(
        "UPDATE med.overdue_med SET dispense_status = $1 WHERE overdue_id = $2 RETURNING *",
        [status, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/overdue/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM med.overdue_med WHERE overdue_id = $1", [id]);
      res.json({ message: "ลบสำเร็จ" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};