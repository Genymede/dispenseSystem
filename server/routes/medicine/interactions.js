// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// // ✅ GET - ทั้งหมด
// router.get("/interactions", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM med_interaction ORDER BY interaction_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ GET - รายการเดียว
// router.get("/interactions/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("SELECT * FROM med_interaction WHERE interaction_id = $1", [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลปฏิกิริยา" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ POST - เพิ่มใหม่
// router.post("/interactions", async (req, res) => {
//   try {
//     const {
//       med_id_1,
//       med_id_2,
//       description,
//       severity,
//       evidence_level,
//       source_reference,
//       is_active,
//       interaction_type
//     } = req.body;
//     console.log(req.body);
//     if (!med_id_1 || !med_id_2 || !description) {
//       return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" });
//     }

//     const result = await pool.query(
//       `INSERT INTO med_interaction 
//         (med_id_1, med_id_2, description, severity, evidence_level, source_reference, is_active, created_at, updated_at, interaction_type)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)
//        RETURNING *`,
//       [med_id_1, med_id_2, description, severity, evidence_level, source_reference, is_active, interaction_type]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ✅ PUT - แก้ไข
// router.put("/interactions/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       med_id_1,
//       med_id_2,
//       description,
//       severity,
//       evidence_level,
//       source_reference,
//       is_active,
//       interaction_type
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE med_interaction
//        SET 
//          med_id_1 = $1,
//          med_id_2 = $2,
//          description = $3,
//          severity = $4,
//          evidence_level = $5,
//          source_reference = $6,
//          is_active = $7,
//          updated_at = NOW(),
//          interaction_type = $8
//        WHERE interaction_id = $9
//        RETURNING *`,
//       [
//         med_id_1,
//         med_id_2,
//         description,
//         severity,
//         evidence_level,
//         source_reference,
//         is_active,
//         interaction_type,
//         id
//       ]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลที่จะแก้ไข" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ DELETE - ลบ
// router.delete("/interactions/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       "DELETE FROM med_interaction WHERE interaction_id = $1 RETURNING *",
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลที่จะลบ" });
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
  // ✅ GET - ทั้งหมด
  router.get("/interactions", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.med_interaction ORDER BY interaction_id DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ GET - รายการเดียว
  router.get("/interactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM med.med_interaction WHERE interaction_id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลปฏิกิริยา" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ POST - เพิ่มใหม่
  router.post("/interactions", async (req, res) => {
    try {
      const {
        med_id_1,
        med_id_2,
        description,
        severity,
        evidence_level,
        source_reference,
        is_active,
        interaction_type
      } = req.body;
      console.log(req.body);
      if (!med_id_1 || !med_id_2 || !description) {
        return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" });
      }

      const result = await pool.query(
        `INSERT INTO med.med_interaction 
          (med_id_1, med_id_2, description, severity, evidence_level, source_reference, is_active, created_at, updated_at, interaction_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)
         RETURNING *`,
        [med_id_1, med_id_2, description, severity, evidence_level, source_reference, is_active, interaction_type]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ PUT - แก้ไข
  router.put("/interactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        med_id_1,
        med_id_2,
        description,
        severity,
        evidence_level,
        source_reference,
        is_active,
        interaction_type
      } = req.body;

      const result = await pool.query(
        `UPDATE med.med_interaction
         SET 
           med_id_1 = $1,
           med_id_2 = $2,
           description = $3,
           severity = $4,
           evidence_level = $5,
           source_reference = $6,
           is_active = $7,
           updated_at = NOW(),
           interaction_type = $8
         WHERE interaction_id = $9
         RETURNING *`,
        [
          med_id_1,
          med_id_2,
          description,
          severity,
          evidence_level,
          source_reference,
          is_active,
          interaction_type,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลที่จะแก้ไข" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ DELETE - ลบ
  router.delete("/interactions/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM med.med_interaction WHERE interaction_id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลที่จะลบ" });
      }

      res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};