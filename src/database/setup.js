import fs from 'fs';
import path from 'path';
import R from 'ramda';
import database from './index.js'

// database.begin()
// .then((transaction) => {
//   transaction.queryAsync(`
//     CREATE TABLE Users (
//       id SERIAL PRIMARY KEY,
//       username VARCHAR(25) NOT NULL UNIQUE,
//       hash VARCHAR(61) NOT NULL,
//       name VARCHAR(71) NOT NULL,
//       profilePicture BYTEA
//     );`)
//   .then(() =>
//     transaction.queryAsync('CREATE UNIQUE INDEX usernameIndex ON Users (username);'))
//   .then(() => transaction.commitAsync())
//   .then(() => console.log('Created users table.'));
// }).catch((err) => console.log(err));

// database.begin()
// .then((transaction) => {
//   transaction.queryAsync(`
//     CREATE TABLE Projects (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(101) NOT NULL UNIQUE,
//       ownerId INTEGER NOT NULL REFERENCES Users(id)
//     );`)
//   .then(() =>
//     transaction.queryAsync('CREATE UNIQUE INDEX projectNameIndex ON Projects (name);'))
//   .then(() => transaction.commitAsync())
//   .then(() => console.log('Created projects table.'));
// }).catch((err) => console.log(err));

// database.begin()
// .then((transaction) => {
//   transaction.queryAsync(`
//     CREATE TABLE Collaborators (
//       userId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
//       projectId INTEGER NOT NULL REFERENCES Projects(id) ON DELETE CASCADE,
//       PRIMARY KEY(userId, projectId)
//     );`)
//   .then(() => transaction.queryAsync('CREATE INDEX collaboratorsUserIndex ON Collaborators (userId);'))
//   .then(() => transaction.commitAsync())
//   .then(() => console.log('Created collaborators table.'));
// }).catch((err) => console.log(err));

database.queryAsync(`
CREATE TABLE Evaluations (
  id SERIAL PRIMARY KEY,
  data JSON NOT NULL,
  projectId INTEGER NOT NULL REFERENCES Projects(id) ON DELETE CASCADE,
  name varchar(21) NOT NULL,
  type INTEGER NOT NULL
);`).catch((err) => console.log(err));