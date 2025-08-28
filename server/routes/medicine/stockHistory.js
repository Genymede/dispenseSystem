const express = require('express');
const router = express.Router();
const pool = require("../../db"); // ใช้ pool จาก pg

// ✅ ดึงประวัติทั้งหมด
router.get('/stock_history', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM med_stock_history ORDER BY time DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error loading stock history:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ ดึงประวัติของยาตัวเดียว
router.get('/stock_history/:med_id', async (req, res) => {
  const { med_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM med_stock_history WHERE med_id = $1 ORDER BY time DESC`,
      [med_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error loading specific stock history:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ เพิ่มประวัติการเปลี่ยนแปลง stock พร้อม balance_after และ reference_id
router.post('/stock_history', async (req, res) => {
  const { med_id, change_type, quantity_change, balance_after, reference_id } = req.body;

  if (!med_id || !change_type || quantity_change == null || balance_after == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO med_stock_history (med_id, change_type, quantity_change, balance_after, reference_id, time)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING history_id
      `,
      [med_id, change_type, quantity_change, balance_after, reference_id || null]
    );

    res.json({ message: 'Stock history added successfully', id: result.rows[0].history_id });
  } catch (err) {
    console.error('🔥 Error inserting stock history:', err);
    res.status(500).json({ error: 'Database insert error' });
  }
});

module.exports = router;
