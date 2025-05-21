const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// User registration route
router.post("/register", authController.register);

// User login route
router.post("/login", authController.login);

// User logout route
router.post("/logout", authController.logout);

// Export the router
module.exports = router;
