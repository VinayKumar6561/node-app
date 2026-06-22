const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

module.exports = router;