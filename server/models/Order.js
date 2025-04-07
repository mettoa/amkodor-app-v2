const pool = require("../db");

const Order = {
  async createOrder(userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const cartItems = await Order.getCartItems(userId);
      if (cartItems.length === 0) {
        throw new Error("Корзина пуста");
      }

      const totalCost = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const orderResult = await client.query(
        `INSERT INTO Orders (user_id, total_cost)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, totalCost]
      );
      const order = orderResult.rows[0];

      await Promise.all(
        cartItems.map((item) =>
          client.query(
            `INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, $4)`,
            [order.order_id, item.product_id, item.quantity, item.price]
          )
        )
      );

      await client.query("DELETE FROM Cart WHERE user_id = $1", [userId]);

      await client.query("COMMIT");
      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async getCartItems(userId) {
    console.log("Запрос корзины для user_id:", userId);
    const { rows } = await pool.query(
      `SELECT c.product_id, c.quantity, p.price
       FROM Cart c
       JOIN Products p ON c.product_id = p.product_id
       WHERE c.user_id = $1`,
      [userId]
    );
    console.log("Результат запроса корзины:", rows);
    return rows;
  },

  async getUserOrders(userId) {
    const query = `
      SELECT o.order_id, o.total_cost, o.status, o.created_at,
        jsonb_agg(jsonb_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase
        )) as items
      FROM Orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async getAllOrders() {
    const query = `
      SELECT o.order_id, o.total_cost, o.status, o.created_at, u.username,
        jsonb_agg(jsonb_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase
        )) as items
      FROM Orders o
      JOIN Users u ON o.user_id = u.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id, u.user_id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async updateOrderStatus(orderId, status) {
    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const query = `
      UPDATE Orders 
      SET status = $1 
      WHERE order_id = $2 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, orderId]);
    return rows[0];
  },
};

module.exports = Order;
