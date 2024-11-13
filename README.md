# Welcome to my GRA - Outsera - Test API

This is a simple system that loads a CSV file into a Better-SQLite3 in memory DB and serves an express.js API with the endpoint `/api/awardsInterval/` to get the producers with the minimum and maximum times between Golden Raspberry Awards.

Use Node v22.11.0 as specified in the file `.node-version`.

After cloning the code, install dependencies with:
```
npm install
```

Then, start the server with:
```
npm start
```

You can customize the DataBase by providing your own `movieslist.csv` file. Just replace the `/src/data/movielist.csv` file. This works as long as the CSV file has the structure with smicolon (";") as separator.
| year    | title  | studios | producers | winner         |
| ------- | ------ | ------- | --------- | -------------- |
| integer |	string | string  | string    | yes / {empty}  |


To run the integration tests, simply run:
```
npm test
```
