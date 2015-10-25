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
  self: serverName.api + 'register'
};

export default function (req, res, next) {
  if (!validations.validateObject(credentialsValidations, req.body)) {
    return next([400, 'Invalid user data.']);
  }

  const { username, password } = req.body;

  bcrypt.genSaltAsync(12)
  .then((salt) => bcrypt.hashAsync(password, salt))
  .then((hash) => db.queryAsync('INSERT INTO Users (username, hash) values ($1, $2);', [username, hash]))
  .then(() => res.json({ _rels, token: jwt.sign({ username }, jwtSecret) }));
}