// const express = require('express');
// const router = express.Router();
// const db = require('../../db');

// router.post('/adr', async (req, res) => {
//     try {
//         const {
//             med_id,
//             patient_id,
//             description,
//             severity,
//             outcome,
//             reporter_id,
//             notes,
//             symptoms
//         } = req.body;

//         const query = `
//             INSERT INTO adr_registry (
//                 med_id,
//                 patient_id,
//                 description,
//                 reported_at,
//                 severity,
//                 outcome,
//                 reporter_id,
//                 notes,
//                 symptoms
//             ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
//             RETURNING *;
//         `;
//         const values = [
//             med_id,
//             patient_id,
//             description,
//             severity,
//             outcome,
//             reporter_id,
//             notes,
//             symptoms
//         ];
//         const result = await db.query(query, values);

//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         console.error('Error creating ADR report:', error);
//         res.status(500).json({
//             message: 'Internal Server Error'
//         });
//     }
// });

// router.get('/adr', async (req, res) => {
//     try {
//         const query = 'SELECT * FROM adr_registry ORDER BY reported_at DESC;';
//         const result = await db.query(query);

//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error('Error fetching ADR reports:', error);
//         res.status(500).json({
//             message: 'Internal Server Error'
//         });
//     }
// });

// router.get('/adr/:id', async (req, res) => {
//     try {
//         const {
//             id
//         } = req.params;
//         const query = 'SELECT * FROM adr_registry WHERE adr_id = $1;';
//         const result = await db.query(query, [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: 'ADR report not found'
//             });
//         }

//         res.status(200).json(result.rows[0]);
//     } catch (error) {
//         console.error('Error fetching single ADR report:', error);
//         res.status(500).json({
//             message: 'Internal Server Error'
//         });
//     }
// });

// router.patch('/adr/:id', async (req, res) => {
//     try {
//         const {
//             id
//         } = req.params;
//         const {
//             med_id,
//             patient_id,
//             description,
//             severity,
//             outcome,
//             reporter_id,
//             notes,
//             symptoms
//         } = req.body;

//         const query = `
//             UPDATE adr_registry
//             SET
//                 med_id = COALESCE($1, med_id),
//                 patient_id = COALESCE($2, patient_id),
//                 description = COALESCE($3, description),
//                 severity = COALESCE($4, severity),
//                 outcome = COALESCE($5, outcome),
//                 reporter_id = COALESCE($6, reporter_id),
//                 notes = COALESCE($7, notes),
//                 symptoms = COALESCE($8, symptoms)
//             WHERE adr_id = $9
//             RETURNING *;
//         `;
//         const values = [
//             med_id,
//             patient_id,
//             description,
//             severity,
//             outcome,
//             reporter_id,
//             notes,
//             symptoms,
//             id
//         ];
//         const result = await db.query(query, values);

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: 'ADR report not found'
//             });
//         }

//         res.status(200).json(result.rows[0]);
//     } catch (error) {
//         console.error('Error updating ADR report:', error);
//         res.status(500).json({
//             message: 'Internal Server Error'
//         });
//     }
// });

// router.delete('/adr/:id', async (req, res) => {
//     try {
//         const {
//             id
//         } = req.params;
//         const query = 'DELETE FROM adr_registry WHERE adr_id = $1 RETURNING *;';
//         const result = await db.query(query, [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: 'ADR report not found'
//             });
//         }

//         res.status(200).json({
//             message: 'ADR report deleted successfully'
//         });
//     } catch (error) {
//         console.error('Error deleting ADR report:', error);
//         res.status(500).json({
//             message: 'Internal Server Error'
//         });
//     }
// });

// module.exports = router;

const express = require("express");

module.exports = (pool) => {
  const router = express.Router();

  /**
   * @route   POST /api/adr
   * @desc    Create a new Adverse Drug Reaction (ADR) report
   * @access  Public
   */
  router.post("/adr", async (req, res) => {
    try {
      const {
        med_id,
        patient_id,
        description,
        severity,
        outcome,
        reporter_id,
        notes,
        symptoms
      } = req.body;

      console.log(`Received POST request for new ADR report at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, req.body);

      if (!med_id || !patient_id || !description || !severity || !reporter_id) {
        return res.status(400).json({ error: "Missing required fields: med_id, patient_id, description, severity, reporter_id" });
      }

      const query = `
        INSERT INTO med.adr_registry (
          med_id, patient_id, description, reported_at, severity, outcome, reporter_id, notes, symptoms
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        med_id,
        patient_id,
        description,
        severity,
        outcome || null,
        reporter_id,
        notes || null,
        symptoms || null
      ];
      const result = await pool.query(query, values);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Error creating ADR report at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: "Database insert failed" });
    }
  });

  /**
   * @route   GET /api/adr
   * @desc    Get a list of all ADR reports
   * @access  Public
   */
  router.get("/adr", async (req, res) => {
    try {
      console.log(`Received GET request for ADR reports at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      const query = "SELECT * FROM med.adr_registry ORDER BY reported_at DESC;";
      const result = await pool.query(query);

      console.log(`Found ${result.rows.length} ADR reports at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(`❌ Error fetching ADR reports at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  /**
   * @route   GET /api/adr/:id
   * @desc    Get a single ADR report by ID
   * @access  Public
   */
  router.get("/adr/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`Received GET request for ADR report/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      const query = "SELECT * FROM med.adr_registry WHERE adr_id = $1;";
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ADR report not found" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Error fetching ADR report/${req.params.id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  /**
   * @route   PATCH /api/adr/:id
   * @desc    Update an existing ADR report
   * @access  Public
   */
  router.patch("/adr/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        med_id,
        patient_id,
        description,
        severity,
        outcome,
        reporter_id,
        notes,
        symptoms
      } = req.body;

      console.log(`Received PATCH request for ADR report/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, req.body);

      const query = `
        UPDATE med.adr_registry
        SET
          med_id = COALESCE($1, med_id),
          patient_id = COALESCE($2, patient_id),
          description = COALESCE($3, description),
          severity = COALESCE($4, severity),
          outcome = COALESCE($5, outcome),
          reporter_id = COALESCE($6, reporter_id),
          notes = COALESCE($7, notes),
          symptoms = COALESCE($8, symptoms)
        WHERE adr_id = $9
        RETURNING *;
      `;
      const values = [
        med_id || null,
        patient_id || null,
        description || null,
        severity || null,
        outcome || null,
        reporter_id || null,
        notes || null,
        symptoms || null,
        id
      ];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ADR report not found" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Error updating ADR report/${req.params.id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: "Database update failed" });
    }
  });

  /**
   * @route   DELETE /api/adr/:id
   * @desc    Delete an ADR report
   * @access  Public
   */
  router.delete("/adr/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`Received DELETE request for ADR report/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      const query = "DELETE FROM med.adr_registry WHERE adr_id = $1 RETURNING *;";
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ADR report not found" });
      }

      res.status(200).json({ message: "ADR report deleted successfully" });
    } catch (error) {
      console.error(`❌ Error deleting ADR report/${req.params.id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: "Database delete failed" });
    }
  });

  return router;
};