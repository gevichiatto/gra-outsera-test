const express = require('express');
const awardsIntervalRouter = require('./awardsInterval');

const router = express.Router();

router.use("/api/awardsInterval/", awardsIntervalRouter);

router.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;