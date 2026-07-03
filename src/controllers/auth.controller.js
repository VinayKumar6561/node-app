const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const db = require("../config/db");

async function check(req, res) {
  res.json({ message: "Authenticated" });
}
async function register(req, res) {
  const { name, email, username, password } = req.body;

  try {
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // 1. check user
    const [existingUser] = await db.query(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username],
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email or Username already exists",
      });
    }

    // 2. hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. insert user
    const [result] = await db.query(
      `INSERT INTO users (name, email, username, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name, email, username, hashedPassword],
    );

    // 5. response
    return res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // 2. Find user
    const [users] = await db.query(
      `SELECT id, name, email, username, password_hash
       FROM users
       WHERE username = ?`,
      [username],
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens
      (user_id, token_hash, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken],
    );

    // 6. Success response
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
module.exports = { register, login, check };
