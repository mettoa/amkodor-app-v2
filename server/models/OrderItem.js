const pool = require("../db");

const OrderItem = {
  async create({ order_id, product_id, quantity, price_at_purchase }) {
    const query = `
      INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [order_id, product_id, quantity, price_at_purchase];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};
