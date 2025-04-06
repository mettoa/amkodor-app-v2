const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const productController = require("../controllers/ProductController");

router.get("/filter", productController.filterProducts);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductByID);
router.get("/category/:id", productController.getProductsByCategory);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  productController.updateProduct
);

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  productController.createProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  productController.deleteProduct
);

module.exports = router;
