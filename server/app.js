require("dotenv").config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");
const {pool} = require("pg");

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(version);
};

const res = pool.query('SELECT * FROM order')
  .then(result => {
    console.log("Database connected successfully!", result.rows);
  })
  .catch(err => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });

http.createServer(requestHandler).listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});