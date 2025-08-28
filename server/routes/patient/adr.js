const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/adr', async (req, res) => {
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

        const query = `
            INSERT INTO adr_registry (
                med_id,
                patient_id,
                description,
                reported_at,
                severity,
                outcome,
                reporter_id,
                notes,
                symptoms
            ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            med_id,
            patient_id,
            description,
            severity,
            outcome,
            reporter_id,
            notes,
            symptoms
        ];
        const result = await db.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating ADR report:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.get('/adr', async (req, res) => {
    try {
        const query = 'SELECT * FROM adr_registry ORDER BY reported_at DESC;';
        const result = await db.query(query);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching ADR reports:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.get('/adr/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const query = 'SELECT * FROM adr_registry WHERE adr_id = $1;';
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'ADR report not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching single ADR report:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.patch('/adr/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
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

        const query = `
            UPDATE adr_registry
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
            med_id,
            patient_id,
            description,
            severity,
            outcome,
            reporter_id,
            notes,
            symptoms,
            id
        ];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'ADR report not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating ADR report:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.delete('/adr/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const query = 'DELETE FROM adr_registry WHERE adr_id = $1 RETURNING *;';
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'ADR report not found'
            });
        }

        res.status(200).json({
            message: 'ADR report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ADR report:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;