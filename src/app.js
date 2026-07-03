const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const corsOptions = require("./config/cors");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/user", require("./routes/user.routes"));

module.exports = app;
