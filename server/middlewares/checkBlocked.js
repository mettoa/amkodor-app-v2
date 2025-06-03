// middlewares/checkBlocked.js
const User = require("../models/User");

exports.checkBlocked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        error:
          "Ваш аккаунт заблокирован. Вы не можете оформлять заказы. Обратитесь к администратору.",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking user block status:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
