import R from 'ramda';
import Promise from 'bluebird';
import anyDB from 'any-db';
import begin from 'any-db-transaction';

const environments = require('../environments');
let dbConnectionString = 'postgres://postgres:postgres@localhost:5432/accesibilidad';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const env = environments.development;
  dbConnectionString = `postgres://postgres:${env.dbpassword}@${env.host}:5432/accesibilidad`;
}

const pool = anyDB.createPool(dbConnectionString, { min: 2, max: 20 });
const beginAsync = Promise.promisify(begin);

export default {
  queryAsync: Promise.promisify(pool.query.bind(pool)),
  begin: () =>
    beginAsync(pool).then((transaction) => {
      Promise.promisifyAll(transaction);
      return transaction;
    })
};