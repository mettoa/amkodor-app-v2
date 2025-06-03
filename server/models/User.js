const bcrypt = require("bcrypt");
const pool = require("../db");

const User = {
  async create({ username, password, email, role }) {
    const query = `
      INSERT INTO Users (username, password, email, role, is_blocked)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [username, password, email, role, false];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async block(id) {
    const query =
      "UPDATE Users SET is_blocked = true WHERE user_id = $1 RETURNING user_id, is_blocked";
    const { rows, rowCount } = await pool.query(query, [id]);
    return { blocked: rowCount > 0, user: rows[0] };
  },

  async unblock(id) {
    const query =
      "UPDATE Users SET is_blocked = false WHERE user_id = $1 RETURNING user_id, is_blocked";
    const { rows, rowCount } = await pool.query(query, [id]);
    return { unblocked: rowCount > 0, user: rows[0] };
  },

  async getAll() {
    const query = `
      SELECT u.*, 
             ua.address, ua.city, ua.state, ua.postal_code, ua.country
      FROM Users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async update(id, username, email, password) {
    try {
      const query = password
        ? "UPDATE Users SET username = $1, email = $2, password = $3 WHERE user_id = $4 RETURNING *"
        : "UPDATE Users SET username = $1, email = $2 WHERE user_id = $3 RETURNING *";
      const values = password
        ? [username, email, password, id]
        : [username, email, id];
      console.log("Executing update query with values:", values);
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  async findByEmail(email) {
    const query = `
      SELECT u.*, 
             ua.address, ua.city, ua.state, ua.postal_code, ua.country
      FROM Users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id
      WHERE u.email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  async findById(user_id) {
    const query = `
      SELECT u.*, 
             ua.address, ua.city, ua.state, ua.postal_code, ua.country
      FROM Users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id
      WHERE u.user_id = $1
    `;
    const { rows } = await pool.query(query, [user_id]);
    console.log(`findById result for user_id ${user_id}:`, rows[0]);
    return rows[0];
  },

  async findOrCreateAddress(userId, addressData) {
    try {
      const checkQuery = "SELECT * FROM user_addresses WHERE user_id = $1";
      const { rows: existingAddresses } = await pool.query(checkQuery, [
        userId,
      ]);

      if (existingAddresses.length > 0) {
        const existingAddress = existingAddresses[0];
        const updatedAddress = {
          address:
            addressData.address !== undefined
              ? addressData.address
              : existingAddress.address,
          city:
            addressData.city !== undefined
              ? addressData.city
              : existingAddress.city,
          state:
            addressData.state !== undefined
              ? addressData.state
              : existingAddress.state,
          postal_code:
            addressData.postal_code !== undefined
              ? addressData.postal_code
              : existingAddress.postal_code,
          country:
            addressData.country !== undefined
              ? addressData.country
              : existingAddress.country,
        };

        const updateQuery = `
          UPDATE user_addresses 
          SET address = $1, city = $2, state = $3, postal_code = $4, country = $5
          WHERE user_id = $6
          RETURNING *
        `;
        const values = [
          updatedAddress.address,
          updatedAddress.city,
          updatedAddress.state,
          updatedAddress.postal_code,
          updatedAddress.country,
          userId,
        ];
        const { rows } = await pool.query(updateQuery, values);
        return rows[0];
      } else {
        const insertQuery = `
          INSERT INTO user_addresses (user_id, address, city, state, postal_code, country)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const values = [
          userId,
          addressData.address || "",
          addressData.city || "",
          addressData.state || "",
          addressData.postal_code || "",
          addressData.city || "",
        ];
        const { rows } = await pool.query(insertQuery, values);
        return rows[0];
      }
    } catch (error) {
      console.error("Error managing address:", error);
      throw error;
    }
  },

  async validatePassword(userId, password) {
    try {
      const query = `SELECT password FROM Users WHERE user_id = $1`;
      const { rows } = await pool.query(query, [userId]);

      if (rows.length === 0) {
        return false;
      }

      if (!rows[0].password) {
        return false;
      }

      const isValid = await bcrypt.compare(password, rows[0].password);
      return isValid;
    } catch (error) {
      console.error("Error validating password:", error);
      return false;
    }
  },
};

module.exports = User;
