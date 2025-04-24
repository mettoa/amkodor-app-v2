const pool = require("../db");

const Category = {
  async getAll() {
    const query = "SELECT * FROM Categories ORDER BY name";
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = Category;
