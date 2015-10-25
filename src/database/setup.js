import fs from 'fs';
import path from 'path';
import R from 'ramda';
import database from './index.js'

database.begin()
.then((transaction) => {
  transaction.queryAsync(`
    CREATE TABLE Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(25) NOT NULL UNIQUE,
      hash VARCHAR(61) NOT NULL
    );`)
  .then(() =>
    transaction.queryAsync('CREATE UNIQUE INDEX usernameIndex ON Users (username);'))
  .then(() => transaction.commitAsync())
  .then(() => console.log('Created users table.'));
}).catch((err) => console.log(err));
