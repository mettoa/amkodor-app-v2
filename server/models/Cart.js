const pool = require("../db");

const Cart = {
  async getAllCarts() {
    const { rows } = await pool.query("SELECT * FROM Cart");
    return rows;
  },

  async getCartByUserId(userId) {
    const { rows } = await pool.query("SELECT * FROM Cart WHERE user_id = $1", [
      userId,
    ]);
    return rows;
  },

  async updateCartItem(userId, productId, quantity) {
    const { rows } = await pool.query(
      `UPDATE Cart 
       SET quantity = $3 
       WHERE user_id = $1 AND product_id = $2 
       RETURNING *`,
      [userId, productId, quantity]
    );
    return rows[0];
  },

  async deleteCartItem(userId, productId) {
    const { rows } = await pool.query(
      `DELETE FROM Cart 
       WHERE user_id = $1 AND product_id = $2 
       RETURNING *`,
      [userId, productId]
    );
    return rows[0];
  },

  async addToCart(userId, productId, quantity) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO Cart (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id) 
         DO UPDATE SET quantity = Cart.quantity + EXCLUDED.quantity
         RETURNING *`,
        [userId, productId, quantity]
      );
      return rows[0];
    } catch (error) {
      console.error("Ошибка в addToCart:", error);
      throw error;
    }
  },
};

module.exports = Cart;
