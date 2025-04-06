const pool = require("../db");

const Order = {
  async create({ user_id, total_cost, status }) {
    const query = `
      INSERT INTO Orders (user_id, total_cost, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [user_id, total_cost, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByUserId(user_id) {
    const query = "SELECT * FROM Orders WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  },
};
