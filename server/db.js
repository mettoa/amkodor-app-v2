const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "223059",
  host: "localhost",
  port: 5432,
  database: "online_store",
});

module.exports = pool;
