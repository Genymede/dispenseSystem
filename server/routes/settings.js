// const express = require('express');
// const pool = require("../db");
// const app = express();

// app.use(express.json());


// app.get('/', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM noti_rules');
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching noti_rules:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/:id', async (req, res) => {
//     const {id} = req.params
//   try {
//     const result = await pool.query('SELECT * FROM noti_rules WHERE rule_id = $1',[id]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching noti_rules:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.put('/:id', async (req, res) => {
//   const { id } = req.params;
//   const { trigger_condition } = req.body;

//   try {
//     const query = `
//       UPDATE noti_rules
//       SET trigger_condition = $1
//       WHERE rule_id = $2
//       RETURNING *;
//     `;
//     const values = [trigger_condition, id];

//     const result = await pool.query(query, values);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Rule not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error updating noti_rules:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// module.exports = app;

const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  router.use(express.json());

  /**
   * @route   GET /api/noti_rules
   * @desc    Get all notification rules
   * @access  Public
   */
  router.get('/', async (req, res) => {
    try {
      console.log(`Received GET request for all noti_rules at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      const result = await pool.query('SELECT * FROM med.noti_rules');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(`❌ Error fetching noti_rules at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  /**
   * @route   GET /api/noti_rules/:id
   * @desc    Get a single notification rule by ID
   * @access  Public
   */
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Received GET request for noti_rules/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
      const result = await pool.query('SELECT * FROM med.noti_rules WHERE rule_id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Error fetching noti_rules/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  /**
   * @route   PUT /api/noti_rules/:id
   * @desc    Update a notification rule by ID
   * @access  Public
   */
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { trigger_condition } = req.body;

    try {
      console.log(`Received PUT request for noti_rules/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, req.body);
      const query = `
        UPDATE med.noti_rules
        SET trigger_condition = $1
        WHERE rule_id = $2
        RETURNING *;
      `;
      const values = [trigger_condition, id];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Error updating noti_rules/${id} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
      res.status(500).json({ error: 'Database update failed' });
    }
  });

  return router;
};