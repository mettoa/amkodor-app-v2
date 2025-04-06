const pool = require("../db");

const Cart = {
  async create({ user_id, product_id, quantity }) {
    const query = `
      INSERT INTO Cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [user_id, product_id, quantity];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByUserId(user_id) {
    const query = "SELECT * FROM Cart WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  },
};
