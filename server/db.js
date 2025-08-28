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


// DB_USER = "postgres"
// DB_HOST = "localhost"
// DB_NAME = "medicine"
// DB_PASSWORD = "1234"
// DB_PORT = 5432
// DB_URL = "postgresql://neondb_owner:npg_t3qyEwMk0hlQ@ep-winter-base-a11hmhs5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
// DB_SCHEMA = "med"


const { Pool } = require("pg");

// ใช้ URL การเชื่อมต่อฐานข้อมูลจากตัวแปรสภาพแวดล้อม
const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// ตรวจสอบการเชื่อมต่อเมื่อเริ่มต้น
pool.connect()
  .then(client => {
    console.log("Database connected successfully!");
    // ปล่อย client กลับสู่ pool ทันทีหลังจากตรวจสอบ
    client.release();
  })
  .catch(err => {
    console.error("Failed to connect to database:", err.message);
    // หากเชื่อมต่อไม่ได้ ให้ปิดการทำงานของแอปพลิเคชัน
    process.exit(1);
  });

// ส่งออก pool object เพื่อให้โมดูลอื่น ๆ สามารถใช้ได้
module.exports = pool;

