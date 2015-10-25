import R from 'ramda';
import Promise from 'bluebird';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validations from '../../utils/validations';
import db from '../../database';
import serverName from '../serverName';

Promise.promisifyAll(bcrypt);
Promise.promisifyAll(jwt);

const jwtSecret = 'kcge76nisbv5ksgv3sifvnwuccpm342vfw';

const credentialsValidations = R.pick(['username', 'password'], validations);

const _rels = {
  self: serverName.api + 'login'
};

export default function (req, res, next) {
  if (!validations.validateObject(credentialsValidations, req.body)) {
    return next([400, 'Invalid user data.']);
  }

  const { username, password } = req.body;

  db.queryAsync('SELECT username, hash FROM Users WHERE username = $1', [`${username}`])
  .then(({ rows }) => {
    if (!rows.length) {
      return next([401, 'Invalid username']);
    }

    return bcrypt.compareAsync(password, rows[0].hash);
  }).then((correctPassword) => {
    if (!correctPassword) {
      return next([401, 'Incorrect password']);
    }

    res.json({
      _rels,
      token: jwt.sign({ username }, jwtSecret)
    });
  });
}