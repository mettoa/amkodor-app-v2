const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const user = await User.create({ username, password, email, role });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const { password, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email } = req.body;
  const id = req.params.id;
  try {
    const user = await User.update(id, username, email);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { user_id } = req.user;
  const {
    username,
    email,
    currentPassword,
    newPassword,
    address,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  try {
    console.log("Received update profile data:", req.body);
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    let updatedUserData = {
      username: username || user.username,
      email: email || user.email,
      password: user.password,
    };

    if (currentPassword && newPassword) {
      console.log("Attempting to update password");
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log("Invalid current password");
        return res
          .status(400)
          .json({ message: "Неверный текущий пароль", success: false });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updatedUserData.password = hashedNewPassword;
      console.log("New password hashed successfully");
    }

    if (address || city || state || postal_code || country) {
      const addressData = {
        address: address || "",
        city: city || "",
        state: state || "",
        postal_code: postal_code || "",
        country: country || "",
      };
      console.log("Updating address with:", addressData);
      await User.findOrCreateAddress(user_id, addressData);
    }

    console.log("Updating user with data:", updatedUserData);
    const updatedUser = await User.update(
      user_id,
      updatedUserData.username,
      updatedUserData.email,
      updatedUserData.password
    );

    const refreshedUser = await User.findById(user_id);
    const { password, ...userData } = refreshedUser;

    console.log("Profile updated successfully:", userData);
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    res
      .status(500)
      .json({ message: "Ошибка при обновлении профиля", success: false });
  }
};
