const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./src/api');
const cors = require('cors');
const { db, loadCSV } = require('./db');

const app = express();

app.use(bodyParser.json());
app.use(cors(), router);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const database = db;
    await loadCSV(path.join(__dirname, 'src/data', 'movielist.csv'));
    console.log('Database configured.', database);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('It is not possible to start and connect to the Database.', error);
    process.exit(1);
  }

}

startServer();

module.exports = app;
