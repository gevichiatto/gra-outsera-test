const { db } = require('../../db');

exports.getMinAndMaxInervalWinners = (req, res) => {
  try {
    const query = db.prepare(`
      WITH AwardedMovies AS (
        SELECT
          p.id AS producer_id,
          p.name AS producer,
          m.year AS previousWin
        FROM
          producers p
          JOIN movie_producers mp ON p.id = mp.producer_id
          JOIN movies m ON mp.movie_id = m.id
        WHERE
          m.winner = 1
        ORDER BY
          p.id, m.year
      ),
      YearDifferences AS (
        SELECT
          producer_id,
          producer,
          previousWin,
          LEAD(previousWin) OVER (PARTITION BY producer_id ORDER BY previousWin) AS followingWin
        FROM
          AwardedMovies
      )
      SELECT
        producer,
        MIN(followingWin - previousWin) AS interval,
        previousWin,
        followingWin
      FROM
        YearDifferences
      WHERE
        followingWin IS NOT NULL
      GROUP BY
        producer_id
      ORDER BY
        interval
    `);

    const data = query.all();

    if (!data.length) {
      res.status(404).send('No records found.');
      return;
    }

    const minInterval = data.at(0);
    const maxInterval = data.at(-1);

    const response = { min: [], max: [] };

    response.min = data.filter(d => d.interval == minInterval.interval);
    response.max = data.filter(d => d.interval == maxInterval.interval);

    return res.json(response);
  } catch (error) {
    console.error('movieListController::getMinAndMaxInervalWinners Error executing search query.', error);
    throw new Error('movieListController::getMinAndMaxInervalWinners Error executing search query.');
  }
}