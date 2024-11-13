const express = require('express');
const awardsIntervalRouter = require('./awardsInterval');

const router = express.Router();

router.use("/api/awardsInterval/", awardsIntervalRouter);

module.exports = router;