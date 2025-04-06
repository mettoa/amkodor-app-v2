const pool = require("../db");

const UserAddress = {
  async create({ user_id, address, city, state, postal_code, country }) {
    const query = `
      INSERT INTO User_Addresses (user_id, address, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [user_id, address, city, state, postal_code, country];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByUserId(user_id) {
    const query = "SELECT * FROM User_Addresses WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  },
};
