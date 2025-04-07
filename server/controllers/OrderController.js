const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log("User ID из токена:", userId);
    const cartItems = await Order.getCartItems(userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    const order = await Order.createOrder(userId);

    res.status(201).json({
      success: true,
      orderId: order.order_id,
      total: order.total_cost,
      status: order.status,
    });
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Не удалось создать заказ",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.getUserOrders(req.user.user_id);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch all orders",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.updateOrderStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update status",
    });
  }
};
