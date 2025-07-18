const express = require("express");
const router = express.Router();

router.get("/about", (req, res) => {
  res.render("pages/about.ejs");
});

router.get("/privacy", (req, res) => {
  res.render("pages/privacy.ejs");
});

router.get("/terms", (req, res) => {
  res.render("pages/terms.ejs");
});


module.exports = router;
