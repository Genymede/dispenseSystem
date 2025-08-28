const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(client => {
    console.log("Medicines database connected successfully!!");
    client.release(); // คืนการเชื่อมต่อกลับไปที่ pool
  })
  .catch(err => {
    console.error("Failed to connect to Medicines database:", err.message);
    process.exit(1); // หยุดเซิร์ฟเวอร์หากเชื่อมต่อไม่ได้
  });

// อ่านข้อมูลทั้งหมด
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM med_table ORDER BY med_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลทั้งหมด
router.get('/med_usage', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM med_usage ORDER BY usage_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// เพิ่มข้อมูลใหม่
router.post('/med_usage', async (req, res) => {
  const { med_id, patient_id, start_datetime, dosage, frequency, route, usage_status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO med_usage (med_id, patient_id, start_datetime, dosage, frequency, route, usage_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [med_id, patient_id, start_datetime, dosage, frequency, route, usage_status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// แก้ไขข้อมูล
router.put('/med_usage/:id', async (req, res) => {
  const { id } = req.params;
  const { med_id, patient_id, start_datetime, dosage, frequency, route, usage_status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE med_usage
       SET med_id = $1, patient_id = $2, start_datetime = $3, dosage = $4, frequency = $5, route = $6, usage_status = $7
       WHERE usage_id = $8
       RETURNING *`,
      [med_id, patient_id, start_datetime, dosage, frequency, route, usage_status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ลบข้อมูล
router.delete('/med_usage/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM med_usage WHERE usage_id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all RAD records
router.get("/rad", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rad_registry ORDER BY rad_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve (acceptance = true)
router.put("/rad/:id/accept", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE rad_registry SET acceptance = true, acceptance_time = NOW() WHERE rad_id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete record
router.delete("/rad/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM rad_registry WHERE rad_id = $1", [id]);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: ยาค้างจ่ายทั้งหมด
router.get("/overdue", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM overdue_med ORDER BY time DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: เปลี่ยนสถานะการจ่าย
router.put("/overdue/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE overdue_med SET dispense_status = $1 WHERE overdue_id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลยาค้างจ่ายนี้" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบรายการยาค้างจ่าย
router.delete("/overdue/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM overdue_med WHERE overdue_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบรายการที่จะลบ" });
    }

    res.json({ message: "ลบรายการสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/allergy", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM allergy_registry");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// อ่านข้อมูลตาม ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM med_table WHERE med_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เพิ่มข้อมูลใหม่
// เพิ่มข้อมูลยาใหม่
router.post("/", async (req, res) => {
  try {
    const {
      med_name,
      med_generic_name,
      med_severity,
      med_counting_t,
      med_marketing,
      med_thai_name,
      med_cost_price = 0,
      med_selling_prix = 0,
      med_medium_p = 0,
      med_dosage_fo,
      med_medical_c,
      med_essential_t,
      med_out_of_sto = false,
      med_replaceme,
      med_TMT_GP_n,
      med_TMT_TP_n,
      med_quantity = 0,
      med_dose_dialc = false,
      med_TMT_code,
      med_TPU_code,
      med_pregnancy,
      med_set_new_p = false,
      mde_dispence_l = 0,
      med_mfg,
      med_exp
    } = req.body;

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!med_name) {
      return res.status(400).json({ error: "ชื่อยาต้องไม่ว่างเปล่า" });
    }

    const result = await pool.query(
      `INSERT INTO med_table (
        med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name, 
    med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form, 
    med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement, 
    "med_TMT_GP_name", "med_TMT_TP_name", med_quantity, med_dose_dialogue, "med_TMT_code", 
    "med_TPU_code", med_pregnancy_cagetory, med_set_new_price, "mde_dispence_IPD_freq", 
    med_mfg, med_exp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *`,
      [
        med_name,
        med_generic_name,
        med_severity,
        med_counting_t,
        med_marketing,
        med_thai_name,
        med_cost_price,
        med_selling_prix,
        med_medium_p,
        med_dosage_fo,
        med_medical_c,
        med_essential_t,
        med_out_of_sto,
        med_replaceme,
        med_TMT_GP_n,
        med_TMT_TP_n,
        med_quantity,
        med_dose_dialc,
        med_TMT_code,
        med_TPU_code,
        med_pregnancy,
        med_set_new_p,
        mde_dispence_l,
        med_mfg,
        med_exp
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลยา" });
  }
});

// แก้ไขข้อมูล
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description } = req.body;
//     const result = await pool.query(
//       "UPDATE medicine SET name = $1, description = $2 WHERE med_id = $3 RETURNING *",
//       [name, description, id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Medicine not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      med_name,
      med_generic_name,
      med_severity,
      med_counting_t,
      med_marketing,
      med_thai_name,
      med_cost_price,
      med_selling_prix,
      med_medium_p,
      med_dosage_fo,
      med_medical_c,
      med_essential_t,
      med_out_of_sto ,
      med_replaceme,
      med_TMT_GP_n,
      med_TMT_TP_n,
      med_quantity ,
      med_dose_dialc,
      med_TMT_code,
      med_TPU_code,
      med_pregnancy,
      med_set_new_p ,
      mde_dispence_l,
      med_mfg,
      med_exp
    } = req.body;

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!med_name) {
      return res.status(400).json({ error: "ชื่อยาต้องไม่ว่างเปล่า" });
    }

    const result = await pool.query(
      `UPDATE med_table SET 
            med_name = $1,
            med_generic_name = $2,
            med_severity = $3,
            med_counting_unit = $4,
            med_marketing_name = $5,
            med_thai_name = $6,
            med_cost_price = $7,
            med_selling_price = $8,
            med_medium_price = $9,
            med_dosage_form = $10,
            med_medical_category = $11,
            med_essential_med_list = $12,
            med_out_of_stock = $13,
            med_replacement = $14,
            "med_TMT_GP_name" = $15,
            "med_TMT_TP_name" = $16,
            med_quantity = $17,
            med_dose_dialogue = $18,
            "med_TMT_code" = $19,
            "med_TPU_code" = $20,
            med_pregnancy_cagetory = $21,
            med_set_new_price = $22,
            "mde_dispence_IPD_freq" = $23,
            med_mfg = $24,
            med_exp = $25
        WHERE 
            med_id = $26  
        RETURNING *;`,
      [
        med_name,
        med_generic_name,
        med_severity,
        med_counting_t,
        med_marketing,
        med_thai_name,
        med_cost_price,
        med_selling_prix,
        med_medium_p,
        med_dosage_fo,
        med_medical_c,
        med_essential_t,
        med_out_of_sto,
        med_replaceme,
        med_TMT_GP_n,
        med_TMT_TP_n,
        med_quantity,
        med_dose_dialc,
        med_TMT_code,
        med_TPU_code,
        med_pregnancy,
        med_set_new_p,
        mde_dispence_l,
        med_mfg,
        med_exp,
        id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating medicine:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลยา" });
  }
});

// ลบข้อมูล
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM med_table WHERE med_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/order-history", async (req, res) => {
  const { patient_id, doctor_id, description, medicines } = req.body

    if (!medicines || medicines.length === 0) {
    return res.status(400).json({ error: "ไม่มีรายการยา" });
  }

  try {
    const query = `
      INSERT INTO med_order_history (time, patient_id, doctor_id, description, medicines)
      VALUES (NOW(), $1, $2, $3, $4) RETURNING *`;
      
    const values = [patient_id, doctor_id, description, JSON.stringify(medicines)];
    const result = await pool.query(query, values);

    res.json({ success: true, inserted: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});




module.exports = router;