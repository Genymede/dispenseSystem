// const express = require("express");
// const router = express.Router();

// const dispensehistoryRouter = require("./despenseHistory")
// const medDeliveryRouter = require("./med_delivery")
// const adrRouter = require("./adr")

// const pool = require("../../db");

// router.use(dispensehistoryRouter)
// router.use(medDeliveryRouter)
// router.use(adrRouter)

// pool.connect()
//   .then(client => {
//     console.log("Patients database connected successfully!!");
//     client.release();
//   })
//   .catch(err => {
//     console.error("Failed to connect to Patients database:", err.message);
//     process.exit(1);
//   });

//   const patientQuery = `
//   SELECT 
//     p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,p.first_name_eng, p.last_name_eng,
//     p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
//     p.phone, p.height, p.weight, p.bmi, p.photo,
//     COALESCE(STRING_AGG(DISTINCT m.med_name, ', '), 'ไม่มีข้อมูล') AS allergy_med_names,
//     COALESCE(STRING_AGG(DISTINCT a.symptoms, ', '), 'ไม่มีข้อมูล') AS allergy_symptoms,
//     addr.house_number, addr.village_number, addr.sub_district, addr.district,
//     addr.province, addr.road, addr.postal_code
//   FROM patient p
//   LEFT JOIN allergy_registry a ON p.patient_id = a.patient_id
//   LEFT JOIN med_table m ON a.med_id = m.med_id
//   LEFT JOIN patient_address addr ON p.patient_addr_id = addr.address_id
// `;

// const groupBy = `
//   GROUP BY 
//     p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
//     p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
//     p.phone, p.height, p.weight, p.bmi,
//     addr.house_number, addr.village_number, addr.sub_district, addr.district,
//     addr.province, addr.road, addr.postal_code
// `;

// // 🟢 อ่านข้อมูลผู้ป่วยทั้งหมด
// router.get("/", async (req, res) => {
//   console.log("Fetching all patients...");
//   try {
//     const result = await pool.query(`${patientQuery} GROUP BY p.patient_id, addr.address_id ORDER BY p.patient_id ASC`);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔍 ค้นหาผู้ป่วย (POST)
// router.post("/", async (req, res) => {
//   try {
//     const { keyword } = req.body;
//     if (!keyword) {
//       return res.status(400).json({ error: "กรุณาระบุคำค้นหา" });
//     }

//     const searchQuery = `
//       ${patientQuery}
//       WHERE p.hn_number = $1 OR p.national_id = $1 OR p.first_name ILIKE $2 OR p.last_name ILIKE $2 
//       OR p.first_name_eng ILIKE $2 OR p.last_name_eng ILIKE $2
//       GROUP BY p.patient_id, addr.address_id
//       ORDER BY p.patient_id ASC
//     `;

//     const result = await pool.query(searchQuery, [keyword, `%${keyword}%`]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "ไม่พบข้อมูลผู้ป่วย" });
//     }

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔎 อ่านข้อมูลผู้ป่วยเฉพาะ ID
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   const searchQuery = `${patientQuery} WHERE p.patient_id = $1 ${groupBy}`;
  
//   try {
//     const result = await pool.query(searchQuery, [id]);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในการค้นหาผู้ป่วย" });
//   }
// });

// module.exports = router;

const express = require("express");


module.exports = (pool) => {
  const router = express.Router();

  const dispensehistoryRouter = require("./despenseHistory")(pool);
  const medDeliveryRouter = require("./med_delivery")(pool);
  const adrRouter = require("./adr")(pool);

  router.use(dispensehistoryRouter);
  router.use(medDeliveryRouter);
  router.use(adrRouter);

  pool.connect()
    .then(client => {
      console.log("Patients database connected successfully!!");
      client.release();
    })
    .catch(err => {
      console.error("Failed to connect to Patients database:", err.message);
      process.exit(1);
    });

  const patientQuery = `
    SELECT 
      p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name, p.first_name_eng, p.last_name_eng,
      p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
      p.phone, p.height, p.weight, p.bmi, p.photo,
      COALESCE(STRING_AGG(DISTINCT m.med_name, ', '), 'ไม่มีข้อมูล') AS allergy_med_names,
      COALESCE(STRING_AGG(DISTINCT a.symptoms, ', '), 'ไม่มีข้อมูล') AS allergy_symptoms,
      addr.house_number, addr.village_number, addr.sub_district, addr.district,
      addr.province, addr.road, addr.postal_code
    FROM med.patient p
    LEFT JOIN med.allergy_registry a ON p.patient_id = a.patient_id
    LEFT JOIN med.med_table m ON a.med_id = m.med_id
    LEFT JOIN med.patient_address addr ON p.patient_addr_id = addr.address_id
  `;

  const groupBy = `
    GROUP BY 
      p.patient_id, p.hn_number, p.national_id, p.first_name, p.last_name,
      p.gender, p.birthday, p.age_y, p.age_m, p.age_d, p.blood_group,
      p.phone, p.height, p.weight, p.bmi,
      addr.house_number, addr.village_number, addr.sub_district, addr.district,
      addr.province, addr.road, addr.postal_code
  `;

  /**
   * @route   GET /api/patients
   * @desc    Get a list of all patients
   * @access  Public
   */
  router.get("/", async (req, res) => {
    console.log(`Received GET request for all patients at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    try {
      const result = await pool.query(`${patientQuery} GROUP BY p.patient_id, addr.address_id ORDER BY p.patient_id ASC`);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(`❌ Error fetching patients at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  /**
   * @route   POST /api/patients
   * @desc    Search for patients by keyword
   * @access  Public
   */
  router.post("/", async (req, res) => {
    try {
      const { keyword } = req.body;
      if (!keyword) {
        return res.status(400).json({ error: "กรุณาระบุคำค้นหา" });
      }

      console.log(`Received POST request for patient search with keyword: ${keyword} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

      const searchQuery = `
        ${patientQuery}
        WHERE p.hn_number = $1 OR p.national_id = $1 OR p.first_name ILIKE $2 OR p.last_name ILIKE $2 
        OR p.first_name_eng ILIKE $2 OR p.last_name_eng ILIKE $2
        GROUP BY p.patient_id, addr.address_id
        ORDER BY p.patient_id ASC
      `;

      const result = await pool.query(searchQuery, [keyword, `%${keyword}%`]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลผู้ป่วย" });
      }

      res.status(200).json(result.rows);
    } catch (err) {
      console.error(`❌ Error searching patients at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  /**
   * @route   GET /api/patients/:id
   * @desc    Get a single patient by ID
   * @access  Public
   */
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const searchQuery = `${patientQuery} WHERE p.patient_id = $1 ${groupBy}`;

    console.log(`Received GET request for patient/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

    try {
      const result = await pool.query(searchQuery, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลผู้ป่วย" });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(`❌ Error fetching patient/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  return router;
};