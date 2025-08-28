const express = require("express");
const router = express.Router();
const pool = require("../../db");
const cron = require("node-cron");

// Get all medication subwarehouse stock
// GET /api/med_subwarehouse/stock
router.get("/stock", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM med_subwarehouse ORDER BY exp_date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stock:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get stock details for a specific medication ID
// GET /api/med_subwarehouse/stock/:med_sid
router.get("/stock/:med_sid", async (req, res) => {
  const { med_sid } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM med_subwarehouse WHERE med_sid = $1",
      [med_sid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No stock found for this medication ID." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stock for med_sid:", med_sid, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new subwarehouse stock entry
// POST /api/med_subwarehouse/stock
router.post("/stock", async (req, res) => {
  try {
    const { med_id, med_quantity, packaging_type, is_divisible, location, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, exp_date, mfg_date } = req.body;
    const newEntry = await pool.query(
      "INSERT INTO med_subwarehouse (med_id, med_quantity, packaging_type, is_divisible, location, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, exp_date, mfg_date, is_expired) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, FALSE) RETURNING *",
      [med_id, med_quantity, packaging_type, is_divisible, location, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, exp_date, mfg_date]
    );
    res.json(newEntry.rows[0]);
  } catch (err) {
    console.error("Error adding stock:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an existing subwarehouse stock entry
// PUT /api/med_subwarehouse/stock/:med_sid
router.put("/stock/:med_sid", async (req, res) => {
  try {
    const { med_sid } = req.params;
    const { med_id, med_quantity, packaging_type, is_divisible, location, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, exp_date, mfg_date, is_expired } = req.body;
    const updatedEntry = await pool.query(
      "UPDATE med_subwarehouse SET med_id = $1, med_quantity = $2, packaging_type = $3, is_divisible = $4, location = $5, med_showname = $6, min_quantity = $7, max_quantity = $8, cost_price = $9, unit_price = $10, med_showname_eng = $11, exp_date = $12, mfg_date = $13, is_expired = $14, updated_at = NOW() WHERE med_sid = $15 RETURNING *",
      [med_id, med_quantity, packaging_type, is_divisible, location, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, exp_date, mfg_date, is_expired || false, med_sid]
    );

    if (updatedEntry.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    res.json(updatedEntry.rows[0]);
  } catch (err) {
    console.error("Error updating stock for med_sid:", req.params.med_sid, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update dispensed quantity
// PUT /api/med_subwarehouse/dispensed/:med_sid
router.put("/dispensed/:med_sid", async (req, res) => {
  try {
    const { med_sid } = req.params;
    const { med_quantity } = req.body;
    const updatedEntry = await pool.query(
      "UPDATE med_subwarehouse SET med_quantity = $1, updated_at = NOW() WHERE med_sid = $2 RETURNING *",
      [med_quantity, med_sid]
    );

    if (updatedEntry.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    res.json(updatedEntry.rows[0]);
  } catch (err) {
    console.error("Error updating dispensed quantity for med_sid:", req.params.med_sid, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a subwarehouse stock entry
// DELETE /api/med_subwarehouse/stock/:med_sid
router.delete("/stock/:med_sid", async (req, res) => {
  try {
    const { med_sid } = req.params;
    console.log("Delete med_sid:", med_sid);

    await pool.query(
      "DELETE FROM med_requests WHERE med_sid = $1",
      [med_sid]
    );

    const deletedEntry = await pool.query(
      "DELETE FROM med_subwarehouse WHERE med_sid = $1 RETURNING *",
      [med_sid]
    );

    if (deletedEntry.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    res.json({ message: "Entry and associated requests were deleted successfully" });
  } catch (err) {
    console.error("Error deleting stock for med_sid:", req.params.med_sid, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Function to check and update stock based on approved requests
const updateStockFromRequests = async () => {
  const client = await pool.connect();
  try {
    console.log(`Starting stock update check from requests at ${new Date().toISOString()}`);
    await client.query("BEGIN"); // Start transaction

    // Select approved requests that haven't been added yet
    const result = await client.query(
      "SELECT request_id, med_id, quantity, origin FROM med_requests WHERE is_approve = true AND is_added = false FOR UPDATE;"
    );
    const approvedRequests = result.rows;

    if (approvedRequests.length === 0) {
      console.log("No new approved requests to process.");
      await client.query("COMMIT");
      return;
    }

    console.log(`Found ${approvedRequests.length} approved requests to process.`);

    for (const request of approvedRequests) {
      const { request_id, med_id, quantity } = request;

      try {
        // Update the quantity in med_subwarehouse table
        const updateQuery = "UPDATE med_subwarehouse SET med_quantity = med_quantity + $1, updated_at = NOW() WHERE med_id = $2 RETURNING *;";
        const updateResult = await client.query(updateQuery, [quantity, med_id]);

        if (updateResult.rows.length === 0) {
          console.warn(`Warning: No matching stock found for med_id ${med_id}.`);
        } else {
          console.log(`Updated stock for med_id ${med_id}, added ${quantity} units.`);
        }

        // Update is_added status for the request
        await client.query(
          "UPDATE med_requests SET is_added = true, updated_at = NOW() WHERE request_id = $1;",
          [request_id]
        );
        console.log(`Marked request_id ${request_id} as added.`);
      } catch (error) {
        console.error(`Error processing request_id ${request_id}:`, error.message);
      }
    }

    await client.query("COMMIT"); // Commit transaction
    console.log("Completed stock update from requests.");
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error in updateStockFromRequests job:", error.message);
  } finally {
    client.release();
  }
};

// Function to check and update expired status without deleting
const updateExpiredStatus = async () => {
  const client = await pool.connect();
  try {
    console.log(`Starting expired status check at ${new Date().toISOString()}`);
    await client.query("BEGIN"); // Start transaction

    // Lock rows to prevent concurrent updates
    const result = await client.query(
      "SELECT med_sid, med_id, med_quantity, med_showname, exp_date, is_expired FROM med_subwarehouse WHERE exp_date IS NOT NULL FOR UPDATE"
    );
    const stockData = result.rows;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to midnight for date comparison
    const expiredStocks = [];

    for (const stock of stockData) {
      try {
        // Validate exp_date
        if (!stock.exp_date || isNaN(new Date(stock.exp_date).getTime())) {
          console.log(`Skipped med_sid: ${stock.med_sid}, med_showname: ${stock.med_showname} due to invalid exp_date`);
          continue;
        }

        const expDate = new Date(stock.exp_date);
        expDate.setHours(0, 0, 0, 0); // Normalize to midnight
        const isExpired = expDate < currentDate;

        console.log(`Checking med_sid: ${stock.med_sid}, med_showname: ${stock.med_showname}, exp_date: ${expDate.toISOString()}, is_expired: ${stock.is_expired}, calculated: ${isExpired}`);

        if (stock.is_expired !== isExpired) {
          // Update is_expired status
          await client.query(
            "UPDATE med_subwarehouse SET is_expired = $1, updated_at = NOW() WHERE med_sid = $2",
            [isExpired, stock.med_sid]
          );
          console.log(`Updated is_expired for med_sid: ${stock.med_sid} to ${isExpired}`);

          if (isExpired && stock.med_quantity > 0) {
            // Check for existing record in expired_medicines
            const existingRecord = await client.query(
              "SELECT 1 FROM expired_medicines WHERE med_sid = $1",
              [stock.med_sid]
            );
            if (existingRecord.rows.length === 0) {
              await client.query(
                "INSERT INTO expired_medicines (med_sid, med_id, status, moved_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
                [stock.med_sid, stock.med_id, "pending"]
              );
              console.log(`Inserted expired medicine for med_sid: ${stock.med_sid}, med_id: ${stock.med_id}`);
              expiredStocks.push(stock);
            } else {
              console.log(`Skipped inserting duplicate record for med_sid: ${stock.med_sid} in expired_medicines`);
            }
          } else if (isExpired && stock.med_quantity <= 0) {
            console.log(`Skipped inserting for med_sid: ${stock.med_sid} due to zero quantity`);
          }
        } else {
          console.log(`No update needed for med_sid: ${stock.med_sid}, is_expired already ${stock.is_expired}`);
        }
      } catch (error) {
        console.error(`Error processing med_sid: ${stock.med_sid}, med_showname: ${stock.med_showname}:`, error.message);
        continue; // Continue with next stock
      }
    }

    await client.query("COMMIT"); // Commit transaction
    console.log(`Completed expired status check. Processed ${stockData.length} items, marked ${expiredStocks.length} as expired.`);
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error in updateExpiredStatus job:", error.message);
  } finally {
    client.release();
  }
};

// Schedule cron job to run daily at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Scheduled expired status check running...");
  updateExpiredStatus();
});
console.log("Running initial expired status check...");
  updateExpiredStatus();
// Schedule cron job to run every 10 minutes, for example
cron.schedule("*/10 * * * *", () => {
  console.log("Scheduled stock update check running...");
  updateStockFromRequests();
});
console.log("Running initial stock update check...");
updateStockFromRequests();

module.exports = router;