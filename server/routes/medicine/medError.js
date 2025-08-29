// const express = require('express');
// const router = express.Router();
// const pool = require('../../db'); // เชื่อมต่อ PostgreSQL

// // ✅ GET: ดูรายการ error medication ทั้งหมด
// router.get('/med_error', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM error_medication ORDER BY time DESC');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// // ✅ POST: เพิ่มเหตุการณ์จ่ายยาผิด พร้อมค่าที่ครบทุกฟิลด์
// router.post('/med_error', async (req, res) => {
//   console.log("AAAAAA ")
//   const {
//     time,
//     patient_id,
//     doctor_id,
//     med_id,
//     med_sid,
//     description,
//     resolved = false // default false ถ้าไม่ได้ส่งมา
//   } = req.body;
//   console.log("error :",req.body)
//   try {
//     const result = await pool.query(
//       `INSERT INTO error_medication (
//         time, patient_id, doctor_id, med_id,med_sid, description,
//         resolved, created_at, updated_at
//       )
//       VALUES (NOW(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
//       RETURNING *`,
//       [ patient_id, doctor_id, med_id, med_sid, description, resolved]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Insert failed');
//   }
// });


// // ✅ PUT: อัปเดตสถานะแก้ไข (resolved)
// router.put('/med_error/:id/resolve', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await pool.query(
//       `UPDATE error_medication
//        SET resolved = true, updated_at = CURRENT_TIMESTAMP
//        WHERE err_med_id = $1 RETURNING *`,
//       [id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).send('Not found');
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Update failed');
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // ✅ GET: ดูรายการ error medication ทั้งหมด
  router.get('/med_error', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM med.error_medication ORDER BY time DESC');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // ✅ POST: เพิ่มเหตุการณ์จ่ายยาผิด พร้อมค่าที่ครบทุกฟิลด์
  router.post('/med_error', async (req, res) => {
    console.log("AAAAAA ")
    const {
      time,
      patient_id,
      doctor_id,
      med_id,
      med_sid,
      description,
      resolved = false // default false ถ้าไม่ได้ส่งมา
    } = req.body;
    console.log("error :",req.body)
    try {
      const result = await pool.query(
        `INSERT INTO med.error_medication (
          time, patient_id, doctor_id, med_id, med_sid, description,
          resolved, created_at, updated_at
        )
        VALUES (NOW(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [patient_id, doctor_id, med_id, med_sid, description, resolved]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Insert failed');
    }
  });

  // ✅ PUT: อัปเดตสถานะแก้ไข (resolved)
  router.put('/med_error/:id/resolve', async (req, res) => {
    const id = req.params.id;

    try {
      const result = await pool.query(
        `UPDATE med.error_medication
         SET resolved = true, updated_at = CURRENT_TIMESTAMP
         WHERE err_med_id = $1 RETURNING *`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).send('Not found');
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Update failed');
    }
  });

  return router;
};