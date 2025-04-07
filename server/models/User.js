const bcrypt = require("bcrypt");
const pool = require("../db");

const User = {
  async create({ username, password, email, role }) {
    const query = `
      INSERT INTO Users (username, password, email, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [username, password, email, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(user_id) {
    const query = "DELETE FROM Users WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);
    return rows[0];
  },

  async getAll() {
    const query = "SELECT * FROM Users";
    const { rows } = await pool.query(query);
    return rows;
  },

  async update(id, username, email) {
    try {
      const result = await pool.query(
        "UPDATE Users SET username = $1, email = $2 WHERE user_id = $3 RETURNING *",
        [username, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByEmail(email) {
    const query = "SELECT * FROM Users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  async findById(user_id) {
    const query = "SELECT * FROM Users WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);
    return rows[0];
  },
};

module.exports = User;
