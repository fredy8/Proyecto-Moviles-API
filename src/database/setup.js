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
//       hash VARCHAR(61) NOT NULL
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
//       userId INTEGER NOT NULL REFERENCES Users(id),
//       projectId INTEGER NOT NULL REFERENCES Projects(id),
//       PRIMARY KEY(userId, projectId)
//     );`)
//   .then(() => transaction.queryAsync('CREATE INDEX collaboratorsUserIndex ON Collaborators (userId);'))
//   .then(() => transaction.commitAsync())
//   .then(() => console.log('Created collaborators table.'));
// }).catch((err) => console.log(err));

database.queryAsync(`
alter table Collaborators
drop constraint collaborators_userid_fkey,
drop constraint collaborators_projectid_fkey,
add constraint collaborators_userid_fkey
   foreign key (userId)
   references Users(id)
   on delete cascade,
add constraint collaborators_projectid_fkey
   foreign key (projectId)
   references Projects(id)
   on delete cascade;
`)
.then(() => console.log('altered collaborators table.'));