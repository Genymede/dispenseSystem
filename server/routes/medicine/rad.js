// const express = require("express");
// const router = express.Router();
// const pool = require("../../db");

// router.get("/rad", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM rad_registry ORDER BY rad_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/rad/:id/accept", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       `UPDATE rad_registry SET acceptance = true, acceptance_time = NOW() WHERE rad_id = $1 RETURNING *`,
//       [id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete("/rad/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query("DELETE FROM rad_registry WHERE rad_id = $1", [id]);
//     res.json({ message: "ลบข้อมูลสำเร็จ" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/rad/:id/approve", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       `UPDATE rad_registry SET acceptance = true, acceptance_time = NOW() WHERE rad_id = $1 RETURNING *`,
//       [id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/rad", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM med.rad_registry ORDER BY rad_id DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/rad/:id/accept", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE med.rad_registry SET acceptance = true, acceptance_time = NOW() WHERE rad_id = $1 RETURNING *`,
        [id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/rad/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM med.rad_registry WHERE rad_id = $1", [id]);
      res.json({ message: "ลบข้อมูลสำเร็จ" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/rad/:id/approve", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE med.rad_registry SET acceptance = true, acceptance_time = NOW() WHERE rad_id = $1 RETURNING *`,
        [id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};