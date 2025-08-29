// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");
// // 
// // Get all allergy records
// router.get("/allergy", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM allergy_registry ORDER BY allr_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add new allergy record
// router.post("/allergy", async (req, res) => {
//   try {
//     const { med_id, patient_id, symptoms, description, severity } = req.body;
    
//     // Validate required fields
//     if (!med_id || !patient_id || !symptoms || !severity ){
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const query = `
//       INSERT INTO allergy_registry (med_id, patient_id, symptoms, description, severity, reported_at, created_at, updated_at)
//       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
//       RETURNING *
//     `;
    
//     const values = [med_id, patient_id, symptoms, description, severity];
//     const result = await pool.query(query, values);
    
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update existing allergy record
// router.put("/allergy/:allr_id", async (req, res) => {
//   try {
//     const { allr_id } = req.params;
//     const { med_id, patient_id, symptoms, description, severity } = req.body;

//     // Validate required fields
//     if (!med_id || !patient_id || !symptoms || !severity ) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const query = `
//       UPDATE allergy_registry 
//       SET med_id = $1, patient_id = $2, symptoms = $3, description = $4, 
//           severity = $5, updated_at = NOW()
//       WHERE allr_id = $6
//       RETURNING *
//     `;
    
//     const values = [med_id, patient_id, symptoms, description, severity, allr_id];
//     const result = await pool.query(query, values);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Allergy record not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../../db");

module.exports = (pool) => {
// Get all allergy records
router.get("/allergy", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM med.allergy_registry ORDER BY allr_id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new allergy record
router.post("/allergy", async (req, res) => {
  try {
    const { med_id, patient_id, symptoms, description, severity } = req.body;
    
    // Validate required fields
    if (!med_id || !patient_id || !symptoms || !severity ){
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO med.allergy_registry (med_id, patient_id, symptoms, description, severity, reported_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
      RETURNING *
    `;
    
    const values = [med_id, patient_id, symptoms, description, severity];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update existing allergy record
router.put("/allergy/:allr_id", async (req, res) => {
  try {
    const { allr_id } = req.params;
    const { med_id, patient_id, symptoms, description, severity } = req.body;

    // Validate required fields
    if (!med_id || !patient_id || !symptoms || !severity ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      UPDATE med.allergy_registry 
      SET med_id = $1, patient_id = $2, symptoms = $3, description = $4, 
          severity = $5, updated_at = NOW()
      WHERE allr_id = $6
      RETURNING *
    `;
    
    const values = [med_id, patient_id, symptoms, description, severity, allr_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Allergy record not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

return router;
};