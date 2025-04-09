const pool = require("../db");

const Product = {
  async create({ productname, description, price, category_id, image_url }) {
    const query = `
      INSERT INTO Products (productname, description, price, category_id, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [productname, description, price, category_id, image_url];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async filter({ category_id, min_price, max_price }) {
    let query = "SELECT * FROM Products WHERE 1=1";
    const params = [];

    if (category_id) {
      query += ` AND category_id = $${params.length + 1}`;
      params.push(category_id);
    }

    if (min_price) {
      query += ` AND price >= $${params.length + 1}`;
      params.push(min_price);
    }

    if (max_price) {
      query += ` AND price <= $${params.length + 1}`;
      params.push(max_price);
    }

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async delete(product_id) {
    const query = "DELETE FROM Products WHERE product_id = $1";
    const { rows } = await pool.query(query, [product_id]);
    return rows[0];
  },

  async getAll() {
    const query = `
      SELECT 
        p.*, 
        c.name AS category_name
      FROM 
        Products p
      JOIN 
        Categories c ON p.category_id = c.category_id
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async update(
    product_id,
    productname,
    description,
    price,
    category_id,
    image_url
  ) {
    const result = await pool.query(
      "UPDATE Products SET productname = $1, description = $2, price = $3, category_id = $4, image_url = $5 WHERE product_id = $6 RETURNING *",
      [productname, description, price, category_id, image_url, product_id]
    );
    return result.rows[0];
  },

  async findByCategory(category_id) {
    const query = "SELECT * FROM Products WHERE category_id = $1";
    const { rows } = await pool.query(query, [category_id]);
    return rows;
  },

  async findByID(product_id) {
    const query = `
      SELECT 
        p.*, 
        c.name AS category_name
      FROM 
        Products p
      JOIN 
        Categories c ON p.category_id = c. category_id
      WHERE 
        p.product_id = $1
    `;
    const { rows } = await pool.query(query, [product_id]);
    return rows[0];
  },
};

module.exports = Product;
