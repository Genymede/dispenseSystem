// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// router.get("/med_usage", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM med_usage ORDER BY usage_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// router.post("/med_usage", async (req, res) => {
//   const { med_id, patient_id, start_datetime, dosage, frequency, route, usage_status } = req.body;
//   try {
//     const result = await pool.query(
//       `INSERT INTO med_usage (med_id, patient_id, start_datetime, dosage, frequency, route, usage_status)
//        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//       [med_id, patient_id, start_datetime, dosage, frequency, route, usage_status]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// router.put("/med_usage/:id", async (req, res) => {
//   const { id } = req.params;
//   const { med_id, patient_id, start_datetime, end_datetime, dosage, frequency, route, usage_status, notes } = req.body;
//   try {
//     const result = await pool.query(
//       `UPDATE med_usage
//        SET med_id = $1, patient_id = $2, start_datetime = $3, end_datetime = $4,
//            dosage = $5, frequency = $6, route = $7, usage_status = $8, note = $9
//        WHERE usage_id = $10 RETURNING *`,
//       [med_id, patient_id, start_datetime, end_datetime, dosage, frequency, route, usage_status, notes, id]
//     );
//     res.json(result.rows[0]);
//   }
//   catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/med_usage", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.med_usage ORDER BY usage_id DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.post("/med_usage", async (req, res) => {
    const { med_id, patient_id, start_datetime, dosage, frequency, route, usage_status } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO med.med_usage (med_id, patient_id, start_datetime, dosage, frequency, route, usage_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [med_id, patient_id, start_datetime, dosage, frequency, route, usage_status]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.put("/med_usage/:id", async (req, res) => {
    const { id } = req.params;
    const { med_id, patient_id, start_datetime, end_datetime, dosage, frequency, route, usage_status, notes } = req.body;
    try {
      const result = await pool.query(
        `UPDATE med.med_usage
         SET med_id = $1, patient_id = $2, start_datetime = $3, end_datetime = $4,
             dosage = $5, frequency = $6, route = $7, usage_status = $8, note = $9
         WHERE usage_id = $10 RETURNING *`,
        [med_id, patient_id, start_datetime, end_datetime, dosage, frequency, route, usage_status, notes, id]
      );
      res.json(result.rows[0]);
    }
    catch (err) {
      res.status(500).send(err.message);
    }
  });

  return router;
};