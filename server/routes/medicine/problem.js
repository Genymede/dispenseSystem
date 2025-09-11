// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// // ✅ GET - ดึงข้อมูลปัญหาทั้งหมด
// router.get("/problems", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT * FROM med_problem ORDER BY reported_at DESC`
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ GET - ดึงปัญหาตาม ID
// router.get("/problems/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       `SELECT * FROM med_problem WHERE problem_id = $1`,
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบปัญหานี้" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ POST - เพิ่มปัญหาใหม่
// router.post("/problems", async (req, res) => {
//   try {
//     const {
//       patient_id,
//       med_id,
//       description,
//       severity,
//       solution,
//       status,
//       reported_by
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO med_problem 
//         (patient_id, med_id, description, severity, solution, status, reported_by, reported_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
//        RETURNING *`,
//       [patient_id, med_id, description, severity, solution, status, reported_by]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ PUT - แก้ไขปัญหา
// router.put("/problems/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       patient_id,
//       med_id,
//       description,
//       severity,
//       solution,
//       status,
//       reported_by
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE med_problem SET 
//         patient_id = $1,
//         med_id = $2,
//         description = $3,
//         severity = $4,
//         solution = $5,
//         status = $6,
//         reported_by = $7,
//         updated_at = NOW()
//        WHERE problem_id = $8
//        RETURNING *`,
//       [patient_id, med_id, description, severity, solution, status, reported_by, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อแก้ไข" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ DELETE - ลบปัญหา
// router.delete("/problems/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       `DELETE FROM med_problem WHERE problem_id = $1 RETURNING *`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อทำการลบ" });
//     }

//     res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // GET - ดึงข้อมูลปัญหาทั้งหมด
  router.get("/problems", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          mp_id,
          med_id,
          description,
          usage_id,
          problem_type,
          reported_by,
          reported_at,
          is_resolved
         FROM med.med_problem 
         ORDER BY reported_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching problems:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการดึงข้อมูลปัญหา: ${err.message}` });
    }
  });

  // GET - ดึงปัญหาตาม ID
  router.get("/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT 
          mp_id,
          med_id,
          description,
          usage_id,
          problem_type,
          reported_by,
          reported_at,
          is_resolved
         FROM med.med_problem 
         WHERE mp_id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบปัญหานี้" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error fetching problem by ID:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการดึงข้อมูลปัญหา: ${err.message}` });
    }
  });

  // POST - เพิ่มปัญหาใหม่
  router.post("/problems", async (req, res) => {
    try {
      const {
        med_id,
        description,
        usage_id,
        problem_type,
        reported_by,
        is_resolved
      } = req.body;

      // ตรวจสอบฟิลด์ที่จำเป็น
      if (!med_id || !description || !usage_id || !problem_type || !reported_by) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด" });
      }

      const result = await pool.query(
        `INSERT INTO med.med_problem 
          (med_id, description, usage_id, problem_type, reported_by, reported_at, is_resolved)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         RETURNING 
          mp_id,
          med_id,
          description,
          usage_id,
          problem_type,
          reported_by,
          reported_at,
          is_resolved`,
        [med_id, description, usage_id, problem_type, reported_by, is_resolved]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating problem:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการเพิ่มปัญหา: ${err.message}` });
    }
  });

  // PUT - แก้ไขปัญหา
  router.put("/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        med_id,
        description,
        usage_id,
        problem_type,
        reported_by,
        is_resolved
      } = req.body;

      // ตรวจสอบฟิลด์ที่จำเป็น
      if (!med_id || !description || !usage_id || !problem_type || !reported_by) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด" });
      }

      const result = await pool.query(
        `UPDATE med.med_problem SET 
          med_id = $1,
          description = $2,
          usage_id = $3,
          problem_type = $4,
          reported_by = $5,
          is_resolved = $6,
          updated_at = NOW()
         WHERE mp_id = $7
         RETURNING 
          mp_id,
          med_id,
          description,
          usage_id,
          problem_type,
          reported_by,
          reported_at,
          is_resolved`,
        [med_id, description, usage_id, problem_type, reported_by, is_resolved, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อแก้ไข" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating problem:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการแก้ไขปัญหา: ${err.message}` });
    }
  });

  // DELETE - ลบปัญหา
  router.delete("/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM med.med_problem 
         WHERE mp_id = $1 
         RETURNING 
          mp_id,
          med_id,
          description,
          usage_id,
          problem_type,
          reported_by,
          reported_at,
          is_resolved`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบปัญหานี้เพื่อทำการลบ" });
      }

      res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว", deleted: result.rows[0] });
    } catch (err) {
      console.error("Error deleting problem:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการลบปัญหา: ${err.message}` });
    }
  });

  // GET - ดึงข้อมูลยาทั้งหมด
  router.get("/medicine", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          med_id,
          med_name,
          med_thai_name
         FROM med.medicine 
         ORDER BY med_id`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการดึงข้อมูลยา: ${err.message}` });
    }
  });

  // GET - ดึงข้อมูลผู้ป่วยทั้งหมด
  router.get("/patient", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          patient_id,
          first_name,
          last_name,
          hn_number,
          national_id
         FROM med.patient 
         ORDER BY patient_id`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching patients:", err);
      res.status(500).json({ error: `เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย: ${err.message}` });
    }
  });

  return router;
};