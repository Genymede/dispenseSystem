// const express = require("express");
// const router = express.Router(); // ดึง pool จาก db.js

// const pool = require("../../db");

// const dispenseHistorySql = `
//   SELECT 
//     moh.history_id,
//     moh.patient_id AS moh_patient_id,
//     moh.dispense_doc_id,
//     moh.doctor_id,
//     TO_CHAR(moh.time, '20yy-mm-dd') AS date,
//     TO_CHAR(moh.time, 'HH24:MI:SS') AS time,
//     moh.description,
//     moh.medicines,
//     p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
//     p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
//     p.phone, p.height, p.weight, p.bmi,
//     COALESCE(STRING_AGG(DISTINCT m.med_name, ', '), 'ไม่มีข้อมูล') AS allergy_med_names,
//     COALESCE(STRING_AGG(DISTINCT a.symptoms, ', '), 'ไม่มีข้อมูล') AS allergy_symptoms,
//     addr.house_number, addr.village_number, addr.sub_district, addr.district,
//     addr.province, addr.road, addr.postal_code
//   FROM med_order_history moh
//   LEFT JOIN patient p ON moh.patient_id = p.patient_id
//   LEFT JOIN allergy_registry a ON p.patient_id = a.patient_id
//   LEFT JOIN med_table m ON a.med_id = m.med_id
//   LEFT JOIN patient_address addr ON p.patient_addr_id = addr.address_id
// `;

// const groupByDispense = `
//   GROUP BY 
//     moh.history_id, moh.patient_id, moh.dispense_doc_id, moh.doctor_id, moh.time, moh.description, moh.medicines,
//     p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
//     p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
//     p.phone, p.height, p.weight, p.bmi,
//     addr.house_number, addr.village_number, addr.sub_district, addr.district,
//     addr.province, addr.road, addr.postal_code
//   ORDER BY moh.time DESC
// `;

// // 🟢 อ่านประวัติการจ่ายยา
// router.get("/dispensehistory", async (req, res) => {
//   try {
//     const sql = dispenseHistorySql + groupByDispense;
//     const result = await pool.query(sql);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลประวัติการจ่ายยา" });
//     }

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔍 อ่านประวัติการจ่ายยาตามวันที่ (เช่น 01, 02, 03)
// router.get("/dispensehistory/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const sql = `
//       ${dispenseHistorySql}
//       WHERE EXTRACT(DAY FROM moh.time) = $1
//       ${groupByDispense}
//     `;
//     const result = await pool.query(sql, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลประวัติการจ่ายยา" });
//     }

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");

module.exports = (pool) => {
  const router = express.Router();

  const dispenseHistorySql = `
    SELECT 
      moh.history_id,
      moh.patient_id AS moh_patient_id,
      moh.dispense_doc_id,
      moh.doctor_id,
      TO_CHAR(moh.time, 'YYYY-MM-DD') AS date,
      TO_CHAR(moh.time, 'HH24:MI:SS') AS time,
      moh.description,
      moh.medicines,
      p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
      p.first_name_eng, p.last_name_eng, p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
      p.phone, p.height, p.weight, p.bmi, p.photo,
      COALESCE(STRING_AGG(DISTINCT m.med_name, ', '), 'ไม่มีข้อมูล') AS allergy_med_names,
      COALESCE(STRING_AGG(DISTINCT a.symptoms, ', '), 'ไม่มีข้อมูล') AS allergy_symptoms,
      addr.house_number, addr.village_number, addr.sub_district, addr.district,
      addr.province, addr.road, addr.postal_code
    FROM med.med_order_history moh
    LEFT JOIN med.patient p ON moh.patient_id = p.patient_id
    LEFT JOIN med.allergy_registry a ON p.patient_id = a.patient_id
    LEFT JOIN med.med_table m ON a.med_id = m.med_id
    LEFT JOIN med.patient_address addr ON p.patient_addr_id = addr.address_id
  `;

  const groupByDispense = `
    GROUP BY 
      moh.history_id, moh.patient_id, moh.dispense_doc_id, moh.doctor_id, moh.time, moh.description, moh.medicines,
      p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
      p.first_name_eng, p.last_name_eng, p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
      p.phone, p.height, p.weight, p.bmi, p.photo,
      addr.house_number, addr.village_number, addr.sub_district, addr.district,
      addr.province, addr.road, addr.postal_code, addr.address_id
    ORDER BY moh.time DESC
  `;

  /**
   * @route   GET /api/dispensehistory
   * @desc    Get a list of all dispense history records
   * @access  Public
   */
  router.get("/dispensehistory", async (req, res) => {
    try {
      console.log(`Received GET request for dispensehistory at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      const sql = `${dispenseHistorySql} ${groupByDispense}`;
      const result = await pool.query(sql);

      console.log(`Found ${result.rows.length} dispense history records at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลประวัติการจ่ายยา" });
      }

      res.json(result.rows);
    } catch (err) {
      console.error(`❌ Error fetching dispensehistory at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  /**
   * @route   GET /api/dispensehistory/:id
   * @desc    Get dispense history records filtered by day of the month
   * @access  Public
   */
  router.get("/dispensehistory/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`Received GET request for dispensehistory/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      // Validate id as a number between 1 and 31
      const day = parseInt(id, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        return res.status(400).json({ error: "Invalid day parameter. Must be a number between 1 and 31" });
      }

      const sql = `
        ${dispenseHistorySql}
        WHERE EXTRACT(DAY FROM moh.time) = $1
        ${groupByDispense}
      `;
      const result = await pool.query(sql, [day]);

      console.log(`Found ${result.rows.length} dispense history records for day ${day} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลประวัติการจ่ายยา" });
      }

      res.json(result.rows);
    } catch (err) {
      console.error(`❌ Error fetching dispensehistory/${req.params.id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  return router;
};