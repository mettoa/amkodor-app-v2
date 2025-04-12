const pool = require("../db");

exports.getAllCarts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Cart");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Ошибка получения корзин:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка получения данных корзин",
    });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const query = `
      SELECT 
        c.user_id,
        c.product_id,
        c.quantity,
        p.productname,
        CAST(p.price AS FLOAT) as price
      FROM Cart c
      JOIN Products p ON c.product_id = p.product_id
      WHERE c.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Ошибка получения корзины:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка получения корзины пользователя",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: "Некорректный productId",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Количество должно быть положительным целым числом",
      });
    }

    const query = `
      INSERT INTO Cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = Cart.quantity + EXCLUDED.quantity
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId, quantity]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Ошибка добавления в корзину:", error);
    if (error.code === "23503") {
      res.status(400).json({
        success: false,
        error: "Пользователь или продукт не существует",
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Ошибка добавления в корзину: ${error.message}`,
      });
    }
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: "Некорректный productId",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Количество должно быть положительным целым числом",
      });
    }

    const query = `
      UPDATE Cart
      SET quantity = $1
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, userId, productId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Запись не найдена" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Ошибка обновления корзины:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Ошибка обновления корзины",
    });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: "Некорректный productId",
      });
    }

    const query = `
      DELETE FROM Cart
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Запись не найдена" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Ошибка удаления из корзины:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка удаления товара из корзины",
    });
  }
};

module.exports = exports;
