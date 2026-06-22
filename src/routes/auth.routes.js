const express = require("express");
const { register, login, check } = require("../controllers/auth.controller");
const router = express.Router();
router.get("/check", check);
// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

module.exports = router;