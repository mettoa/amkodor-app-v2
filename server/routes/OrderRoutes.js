const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const orderController = require("../controllers/OrderController");

router.put("/:id/status", authenticate, orderController.updateOrderStatus);

router.post(
  "/",
  authenticate,
  authorize(["buyer"]),
  orderController.createOrder
);

router.get(
  "/user",
  authenticate,
  authorize(["buyer"]),
  orderController.getUserOrders
);

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  orderController.getAllOrders
);

module.exports = router;
