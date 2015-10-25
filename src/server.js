import express from 'express';
import bodyParser from 'body-parser';
import database from './database';
import api from './api';

const app = express();

let clientPort = 80;

if (app.get('env') === 'development') {
  clientPort = 8080;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', api);

const server = app.listen(3000, () =>
  console.log(`Server listening http://localhost:${server.address().port}`));