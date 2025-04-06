const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authenticate, authorize } = require("../middlewares/auth");

router.get(
  "/email",
  authenticate,
  authorize(["admin"]),
  userController.getUserByEmail
);
router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get(
  "/:id",
  authenticate,
  authorize(["admin"]),
  userController.getUserByID
);

router.post("/", authenticate, userController.createUser);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  userController.updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  userController.deleteUser
);

module.exports = router;
