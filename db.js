const Database = require('better-sqlite3');
const fs = require('fs');
const csv = require('csv-parser');

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    winner BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE IF NOT EXISTS producers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS studios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS movie_producers (
    movie_id INTEGER,
    producer_id INTEGER,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, producer_id)
  );
  
  CREATE TABLE IF NOT EXISTS movie_studios (
    movie_id INTEGER,
    studio_id INTEGER,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, studio_id)
  );
`);

/**
 * Converts the row studios and producers string into arrays of string to make 
 * the DB inserting step cleaner
 * @param {object} row A row object with properties year, title, studios, producers, and winner
 * @returns {object} the row object with the properties studios and producers as a array of strings
 */
function formatRow(row) {
  if (!row.year || row.year === "") {
    throw new Error(`It is not possible to process row with empty year.`);
  }

  if (!row.title || row.title === "") {
    throw new Error(`It is not possible to process row with empty title.`);
  }

  if (!row.studios || row.studios === "") {
    throw new Error(`It is not possible to process row with empty studio.`);
  }

  if (!row.producers || row.producers === "") {
    throw new Error(`It is not possible to process row with empty producer.`);
  }

  const studios = row.studios.split(',').map(s => s.trim());
  const producers = row.producers.split(' and ').map(p => p.trim().split(',').map(pp => pp.trim()).filter(el => el.trim() !== '')).flat();

  return {
    year: row.year,
    title: row.title,
    studios: studios,
    producers: producers,
    winner: row.winner
  };
}

/**
 * Loads the CSV file containing the movielist into SQLite.
 * The columns of the CSV file should be year, title, studios, producers, and winner.
 * @param {string} filePath The path for the CSV file.
 * @returns {promise} A promise that resolves with the completion of data reading and rejects any error.
 */
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const insertMovie = db.prepare(`
      INSERT INTO movies (year, title, winner) VALUES (?, ?, ?)
    `);
    const insertProducer = db.prepare(`
      INSERT OR IGNORE INTO producers (name) VALUES (?)
      `);
    const insertStudio = db.prepare(`
      INSERT OR IGNORE INTO studios (name) VALUES (?)
    `);
    const insertMovieProducer = db.prepare(`
      INSERT INTO movie_producers (movie_id, producer_id) VALUES (?, ?)
    `);
    const insertMovieStudio = db.prepare(`
      INSERT INTO movie_studios (movie_id, studio_id) VALUES (?, ?)
    `);

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const formattedRow = formatRow(row);
        const movieInserted = insertMovie.run(
          formattedRow.year,
          formattedRow.title,
          formattedRow.winner === 'yes' ? 1 : 0
        );

        const movieId = movieInserted.lastInsertRowid;

        for (const producer of formattedRow.producers) {
          insertProducer.run(producer);
          const producerId = db.prepare(`SELECT id FROM producers WHERE name = ?`).get(producer).id;
          insertMovieProducer.run(movieId, producerId);
        }

        for (const studio of formattedRow.studios) {
          insertStudio.run(studio);
          const studioId = db.prepare(`SELECT id FROM studios WHERE name = ?`).get(studio).id;
          insertMovieStudio.run(movieId, studioId);
        }
      })
      .on('end', () => {
        console.log('CSV data loaded into SQLite.');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error loading CSV data:', error);
        reject(error);
      });
  });
}

module.exports = { db, loadCSV };
