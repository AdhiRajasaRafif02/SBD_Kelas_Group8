const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// User registration route
router.post("/register", authController.register);

// User login route
router.post("/login", authController.login);

// User logout route
router.post("/logout", authController.logout);

router.get("/verify", authMiddleware, authController.verifySession);

// Export the router
module.exports = router;
