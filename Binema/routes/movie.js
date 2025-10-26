const express = require("express");
const router = express.Router();
const dbConn = require("../config/db");

router.get("/test", (req, res) => {
  dbConn.query("SELECT 1+1 AS result", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

module.exports = router;
