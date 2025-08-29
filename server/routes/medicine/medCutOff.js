// // routes/medCutOffPeriod.js
// const express = require('express');
// const router = express.Router();
// const pool = require('../../db'); // ใช้ pg.Pool

// // GET: รายการทั้งหมด
// router.get('/med_cut_off_period', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT
//         med_cut_off_period.*,
//         sub_warehouse.name AS sub_warehouse_name
//       FROM
//           med_cut_off_period
//       JOIN
//           sub_warehouse ON med_cut_off_period.sub_warehouse_id = sub_warehouse.sub_warehouse_id
//       ORDER BY med_period_id DESC
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST: เพิ่มใหม่
// router.post('/med_cut_off_period', async (req, res) => {
//   const {
//     period_day,
//     period_month,
//     period_time_h,
//     period_time_m,
//     sub_warehouse_id,
//     is_active = true
//   } = req.body;

//   try {
//     const result = await pool.query(`
//       INSERT INTO med_cut_off_period (
//         period_day, period_month, period_time_h, period_time_m,
//         sub_warehouse_id, is_active, created_at
//       ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
//       RETURNING *
//     `, [period_day, period_month, period_time_h, period_time_m, sub_warehouse_id, is_active]);

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // PUT: แก้ไขตาม ID
// router.put('/med_cut_off_period/:id', async (req, res) => {
//   console.log("edit period")
//   console.log()
//   const {id }= req.params;
//   const {
//     period_day,
//     // period_month,
//     // period_time_h,
//     // period_time_m,
//     // sub_warehouse_id,
//     is_active
//   } = req.body;

//   try {
//     const result = await pool.query(`
//       UPDATE med_cut_off_period SET
//         period_day = $1,
//         is_active = $2,
//         updated_at = NOW()
//       WHERE med_period_id = $3
//       RETURNING *
//     `, [period_day, is_active, id]);

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'ไม่พบรายการที่จะแก้ไข' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // DELETE: ลบรายการ
// router.delete('/med_cut_off_period/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await pool.query(`
//       DELETE FROM med_cut_off_period WHERE med_period_id = $1
//     `, [id]);

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'ไม่พบรายการที่จะลบ' });
//     }
//     res.json({ message: 'ลบรายการสำเร็จ' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // GET: รายการทั้งหมด
  router.get('/med_cut_off_period', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          med_cut_off_period.*,
          sub_warehouse.name AS sub_warehouse_name
        FROM
            med.med_cut_off_period
        JOIN
            med.sub_warehouse ON med_cut_off_period.sub_warehouse_id = sub_warehouse.sub_warehouse_id
        ORDER BY med_period_id DESC
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: เพิ่มใหม่
  router.post('/med_cut_off_period', async (req, res) => {
    const {
      period_day,
      period_month,
      period_time_h,
      period_time_m,
      sub_warehouse_id,
      is_active = true
    } = req.body;

    try {
      const result = await pool.query(`
        INSERT INTO med.med_cut_off_period (
          period_day, period_month, period_time_h, period_time_m,
          sub_warehouse_id, is_active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *
      `, [period_day, period_month, period_time_h, period_time_m, sub_warehouse_id, is_active]);

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT: แก้ไขตาม ID
  router.put('/med_cut_off_period/:id', async (req, res) => {
    console.log("edit period")
    console.log()
    const {id }= req.params;
    const {
      period_day,
      is_active
    } = req.body;

    try {
      const result = await pool.query(`
        UPDATE med.med_cut_off_period SET
          period_day = $1,
          is_active = $2,
          updated_at = NOW()
        WHERE med_period_id = $3
        RETURNING *
      `, [period_day, is_active, id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'ไม่พบรายการที่จะแก้ไข' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE: ลบรายการ
  router.delete('/med_cut_off_period/:id', async (req, res) => {
    const id = req.params.id;

    try {
      const result = await pool.query(`
        DELETE FROM med.med_cut_off_period WHERE med_period_id = $1
      `, [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'ไม่พบรายการที่จะลบ' });
      }
      res.json({ message: 'ลบรายการสำเร็จ' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};