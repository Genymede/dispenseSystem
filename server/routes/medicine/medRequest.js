// const express = require("express");
// const router = express.Router();
// const pool = require("../../db"); // เชื่อมต่อกับ PostgreSQL

// // GET: รายการคำขอทั้งหมด
// router.get("/med_requests", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM med_requests ORDER BY request_time DESC");
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching med requests:", err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // POST: เพิ่มคำขอใหม่
// router.post("/med_requests", async (req, res) => {
//   console.log("requested");
//   const {
//     med_id,
//     quantity,
//     unit,
//     requested_by,
//     note,
//     origin,
//     med_sid
//   } = req.body;
//   console.log("Received request data:", req.body);
//   if (!med_id || !quantity || !unit || !requested_by) {
//     return res.status(400).json({ error: "Missing required fields: med_id, quantity, unit, and requested_by" });
//   }
//   const status = "pending";
//   const is_approve = false; // กำหนดค่าเริ่มต้นเป็น false
//   try {
//     const result = await pool.query(
//       `INSERT INTO med_requests 
//       (med_id, quantity, unit, requested_by, status, request_time, note, created_at, is_approve, origin, med_sid)
//       VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW(), $7, $8, $9)
//       RETURNING *`,
//       [med_id, quantity, unit, requested_by, status, note, is_approve, origin, med_sid]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error inserting med request:", err);
//     res.status(500).json({ error: "Database insert error" });
//   }
// });

// // PUT: แก้ไขข้อมูลคำขอทั้งหมด
// router.put("/med_requests/:id", async (req, res) => {
//   const { id } = req.params;
//   const {
//     med_id,
//     quantity,
//     unit,
//     requested_by,
//     approved_by,
//     status,
//     note,
//     is_approve,
//     origin,
//     med_sid
//   } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE med_requests SET 
//         med_id = $1, 
//         quantity = $2, 
//         unit = $3, 
//         requested_by = $4, 
//         approved_by = $5, 
//         status = $6, 
//         note = $7, 
//         is_approve = $8,
//         origin = $9,
//         med_sid = $10,
//         updated_at = NOW()
//       WHERE request_id = $11
//       RETURNING *`,
//       [med_id, quantity, unit, requested_by, approved_by, status, note, is_approve, origin, med_sid, id]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Request not found." });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error updating med request:", err);
//     res.status(500).json({ error: "Update failed" });
//   }
// });

// // PATCH: แก้ไขสถานะและ timestamp
// router.patch("/med_requests/:id/status", async (req, res) => {
//   const { id } = req.params;
//   const { status, approved_by, is_approve } = req.body; // เพิ่ม is_approve

//   const timestampField =
//     status === "approved"
//       ? "approved_time"
//       : status === "dispensed"
//       ? "dispensed_time"
//       : null;

//   const updateFields = [`status = $1`, `is_approve = $2`, `updated_at = NOW()`];
//   const values = [status, is_approve];
//   let paramIdx = 3;

//   if (timestampField) {
//     updateFields.push(`${timestampField} = NOW()`);
//   }

//   if (approved_by) {
//     updateFields.push(`approved_by = $${paramIdx++}`);
//     values.push(approved_by);
//   }

//   values.push(id);

//   try {
//     const result = await pool.query(
//       `UPDATE med_requests SET ${updateFields.join(", ")} WHERE request_id = $${paramIdx} RETURNING *`,
//       values
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Request not found." });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error updating status:", err);
//     res.status(500).json({ error: "Update failed" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // GET: รายการคำขอทั้งหมด
  router.get("/med_requests", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.med_requests ORDER BY request_time DESC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching med requests:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // POST: เพิ่มคำขอใหม่
  router.post("/med_requests", async (req, res) => {
    console.log("requested");
    const {
      med_id,
      quantity,
      unit,
      requested_by,
      note,
      origin,
      med_sid
    } = req.body;
    console.log("Received request data:", req.body);
    if (!med_id || !quantity || !unit || !requested_by) {
      return res.status(400).json({ error: "Missing required fields: med_id, quantity, unit, and requested_by" });
    }
    const status = "pending";
    const is_approve = false; // กำหนดค่าเริ่มต้นเป็น false
    try {
      const result = await pool.query(
        `INSERT INTO med.med_requests 
        (med_id, quantity, unit, requested_by, status, request_time, note, created_at, is_approve, origin, med_sid)
        VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW(), $7, $8, $9)
        RETURNING *`,
        [med_id, quantity, unit, requested_by, status, note, is_approve, origin, med_sid]
      );
      console.log("request success")
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error inserting med request:", err);
      res.status(500).json({ error: "Database insert error" });
    }
  });

  // PUT: แก้ไขข้อมูลคำขอทั้งหมด
  router.put("/med_requests/:id", async (req, res) => {
    const { id } = req.params;
    const {
      med_id,
      quantity,
      unit,
      requested_by,
      approved_by,
      status,
      note,
      is_approve,
      origin,
      med_sid
    } = req.body;

    try {
      const result = await pool.query(
        `UPDATE med.med_requests SET 
          med_id = $1, 
          quantity = $2, 
          unit = $3, 
          requested_by = $4, 
          approved_by = $5, 
          status = $6, 
          note = $7, 
          is_approve = $8,
          origin = $9,
          med_sid = $10,
          updated_at = NOW()
        WHERE request_id = $11
        RETURNING *`,
        [med_id, quantity, unit, requested_by, approved_by, status, note, is_approve, origin, med_sid, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Request not found." });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating med request:", err);
      res.status(500).json({ error: "Update failed" });
    }
  });

  // PATCH: แก้ไขสถานะและ timestamp
  router.patch("/med_requests/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, approved_by, is_approve } = req.body;

    const timestampField =
      status === "approved"
        ? "approved_time"
        : status === "dispensed"
        ? "dispensed_time"
        : null;

    const updateFields = [`status = $1`, `is_approve = $2`, `updated_at = NOW()`];
    const values = [status, is_approve];
    let paramIdx = 3;

    if (timestampField) {
      updateFields.push(`${timestampField} = NOW()`);
    }

    if (approved_by) {
      updateFields.push(`approved_by = $${paramIdx++}`);
      values.push(approved_by);
    }

    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE med.med_requests SET ${updateFields.join(", ")} WHERE request_id = $${paramIdx} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Request not found." });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).json({ error: "Update failed" });
    }
  });

  return router;
};