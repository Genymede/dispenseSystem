// const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.connect()
//   .then(client => {
//     console.log("Database connected successfully!");
//     client.release();
//   })
//   .catch(err => {
//     console.error("Failed to connect to database:", err.message);
//     process.exit(1);
//   });

// module.exports = pool;


const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL, // ใช้ connection string จาก .env
  ssl: {
    rejectUnauthorized: false, // อนุญาตให้เชื่อมต่อโดยไม่ตรวจสอบใบรับรอง SSL (สำหรับ Neon DB)
  },
});

// ทดสอบการเชื่อมต่อ
pool.connect()
  .then(client => {
    console.log("Database connected successfully!");
    client.release();
  })
  .catch(err => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });



module.exports = pool;