const express = require("express");
const { register, login, check, getRefreshToken } = require("../controllers/auth.controller");
const router = express.Router();
router.get("/check", check);
// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// REFRESH TOKEN
router.post("/refresh-token", getRefreshToken);

module.exports = router;