const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// Load env variables

const app = express();

// Regular Middlewares
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/user", require("./routes/user.routes"));

module.exports = app;
