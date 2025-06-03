const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authenticate, authorize } = require("../middlewares/auth");

router.get("/profile/me", authenticate, userController.getMyProfile);

router.get(
  "/email",
  authenticate,
  authorize(["admin"]),
  userController.getUserByEmail
);
router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get("/:id", authenticate, userController.getUserByID);

// Заменяем удаление на блокировку/разблокировку
router.patch(
  "/:id/block",
  authenticate,
  authorize(["admin"]),
  userController.blockUser
);
router.patch(
  "/:id/unblock",
  authenticate,
  authorize(["admin"]),
  userController.unblockUser
);

router.post("/", authenticate, userController.createUser);

router.put("/profile", authenticate, userController.updateProfile);
router.put(
  "/:id",
  authenticate,
  authorize(["buyer"], ["admin"]),
  userController.updateUser
);

module.exports = router;
