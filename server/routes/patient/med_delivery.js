const express = require("express");
const router = express.Router();
const pool = require("../../db");

// 🔹 GET all delivery records
router.get("/med_delivery", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, CONCAT(p.first_name, ' ', p.last_name) AS patient_name, p.hn_number, p.national_id
      FROM med_delivery d
      LEFT JOIN patient p ON d.patient_id = p.patient_id
      ORDER BY d.delivery_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST a new delivery
router.post("/med_delivery", async (req, res) => {
  const {
    patient_id,
    delivery_method,
    receiver_name,
    receiver_phone,
    address,
    note,
    status,
    medicine_list // 🔸 รับเป็น array ของ { med_id, quantity }
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO med_delivery (
        patient_id, delivery_method, receiver_name, receiver_phone,
        address, note, status, medicine_list
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING *`,
      [
        patient_id,
        delivery_method,
        receiver_name,
        receiver_phone,
        address,
        note,
        status || "Pending",
        JSON.stringify(medicine_list || [])
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT update delivery info
router.put("/med_delivery/:id", async (req, res) => {
  const { id } = req.params;
  const {
    delivery_method,
    receiver_name,
    receiver_phone,
    address,
    note,
    status,
    medicine_list
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE med_delivery SET
         delivery_method = $1,
         receiver_name = $2,
         receiver_phone = $3,
         address = $4,
         note = $5,
         status = $6,
         medicine_list = $7::jsonb
       WHERE delivery_id = $8
       RETURNING *`,
      [
        delivery_method,
        receiver_name,
        receiver_phone,
        address,
        note,
        status,
        JSON.stringify(medicine_list || []),
        id
      ]
    );
    if(status === "delivered"){
      const res = pool.query(
        `UPDATE med_delivery
        SET delivery_date = NOW()
        WHERE delivery_id = $1`
      ,[id])
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE
router.delete("/med_delivery/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM med_delivery WHERE delivery_id = $1", [id]);
    res.json({ message: "ลบข้อมูลการจัดส่งเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
