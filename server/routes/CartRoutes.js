const express = require("express");
const router = express.Router();
const cartController = require("../controllers/CartController");
const { authenticate, authorize } = require("../middlewares/auth");

router.get("/", authenticate, authorize(["buyer"]), cartController.getUserCart);
router.post(
  "/:productId",
  authenticate,
  authorize(["buyer"]),
  cartController.addToCart
);
router.put(
  "/:productId",
  authenticate,
  authorize(["buyer"]),
  cartController.updateCartItem
);
router.delete(
  "/:productId",
  authenticate,
  authorize(["buyer"]),
  cartController.deleteCartItem
);
router.get(
  "/all",
  authenticate,
  authorize(["admin"]),
  cartController.getAllCarts
);

module.exports = router;
