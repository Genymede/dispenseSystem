// const express = require('express');
// const router = express.Router();
// const pool = require('../db');

// // ✅ whitelist เฉพาะตารางที่อนุญาตเพื่อความปลอดภัย
// const allowedTables = [
//   "adr_registry", "allergy_registry", "error_medication",
//   "med_compatibility", "med_concominant", "med_cut_off_period",
//   "med_delivery", "med_evaluation", "med_interaction",
//   "med_order_history", "med_order_rights", "med_probolem",
//   "med_table", "med_usage", "medicine_order", "medicines_TEST",
//   "overdue_med", "patient", "patient_address", "rad_registry",
//   "roles", "sticker_form", "sub_warehouse", "temp_humidity"
// ];

// // Dynamic route: /report/:table
// router.get('/:table', async (req, res) => {
//   const table = req.params.table;

//   if (!allowedTables.includes(table)) {
//     return res.status(400).json({ error: 'ไม่อนุญาตให้เข้าถึงตารางนี้' });
//   }

//   try {
//     const result = await pool.query(`SELECT * FROM ${table} `);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Query Error:', err);
//     res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
//   }
// });

// module.exports = router;

const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // ✅ Whitelist เฉพาะตารางที่อนุญาตเพื่อความปลอดภัย
  const allowedTables = [
    "adr_registry", "allergy_registry", "error_medication",
    "med_compatibility", "med_concominant", "med_cut_off_period",
    "med_delivery", "med_evaluation", "med_interaction",
    "med_order_history", "med_order_rights", "med_probolem",
    "med_table", "med_usage", "medicine_order", "medicines_TEST",
    "overdue_med", "patient", "patient_address", "rad_registry",
    "roles", "sticker_form", "sub_warehouse", "temp_humidity"
  ];

  /**
   * @route   GET /api/report/:table
   * @desc    Get all records from a specified table
   * @access  Public
   */
  router.get('/:table', async (req, res) => {
    const table = req.params.table;

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'ไม่อนุญาตให้เข้าถึงตารางนี้' });
    }

    try {
      console.log(`Received GET request for table ${table} at ${new DateA.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      const result = await pool.query(`SELECT * FROM med.${table}`);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(`❌ Query Error for table ${table} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  });

  return router;
};