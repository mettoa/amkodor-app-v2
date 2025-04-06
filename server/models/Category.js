const pool = require("../db");

const Category = {
  async create({ name, parent_category_id }) {
    const query = `
      INSERT INTO Categories (name, parent_category_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [name, parent_category_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findAll() {
    const query = "SELECT * FROM Categories";
    const { rows } = await pool.query(query);
    return rows;
  },
};
