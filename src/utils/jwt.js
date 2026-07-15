const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// access token (short life)
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

// refresh token (long life)
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  ACCESS_SECRET,
  REFRESH_SECRET
};