const router = require("express").Router();
const {
  createAdmin,
  addAdmin,
  getAllUsers,
  getUserbyId,
  deleteUser,
} = require("../controllers/admin.controllers");

const { isAdmin } = require("../middleware/admin");
const { restrict } = require("../middleware/restrict");

router.post("/admin", restrict, isAdmin, createAdmin);
router.put("/admin/:id", restrict, isAdmin, addAdmin);
router.get("/users", restrict, isAdmin, getAllUsers);
router.get("/users/:id", restrict, isAdmin, getUserbyId);
router.delete("/users/:id", restrict, isAdmin, deleteUser);

module.exports = router;
