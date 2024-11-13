const express = require('express');
const { getMinAndMaxInervalWinners } = require('../controllers/awardsWinnersController');

const awardsIntervalRouter = express.Router();

awardsIntervalRouter.get('/', (req, res) => {
  try {
    return getMinAndMaxInervalWinners(req, res);
  } catch (error) {
    res.status(500).json('Server error.');
  }
});

module.exports = awardsIntervalRouter;