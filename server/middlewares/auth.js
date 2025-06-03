const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Проверяем актуальную информацию о пользователе из базы данных
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Проверяем, не заблокирован ли пользователь
    if (user.is_blocked) {
      return res.status(403).json({
        error: "Ваш аккаунт заблокирован. Обратитесь к администратору.",
      });
    }

    req.user = {
      user_id: user.user_id,
      role: user.role,
      is_blocked: user.is_blocked,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.authorize = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Permission denied" });
  }
  next();
};
