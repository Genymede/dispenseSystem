const express = require("express");
const router = express.Router();
const pool = require("../../db");

// ✅ GET - ดึงข้อมูลปัญหาทั้งหมด
router.get("/problems", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM med_problem ORDER BY reported_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET - ดึงปัญหาตาม ID
router.get("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM med_problem WHERE problem_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบปัญหานี้" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST - เพิ่มปัญหาใหม่
router.post("/problems", async (req, res) => {
  try {
    const {
      patient_id,
      med_id,
      description,
      severity,
      solution,
      status,
      reported_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO med_problem 
        (patient_id, med_id, description, severity, solution, status, reported_by, reported_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [patient_id, med_id, description, severity, solution, status, reported_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT - แก้ไขปัญหา
router.put("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patient_id,
      med_id,
      description,
      severity,
      solution,
      status,
      reported_by
    } = req.body;

    const result = await pool.query(
      `UPDATE med_problem SET 
        patient_id = $1,
        med_id = $2,
        description = $3,
        severity = $4,
        solution = $5,
        status = $6,
        reported_by = $7,
        updated_at = NOW()
       WHERE problem_id = $8
       RETURNING *`,
      [patient_id, med_id, description, severity, solution, status, reported_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อแก้ไข" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE - ลบปัญหา
router.delete("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM med_problem WHERE problem_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อทำการลบ" });
    }

    res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
