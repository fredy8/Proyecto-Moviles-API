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
  console.log(username);

  db.begin()
  .then((transaction) => 
    transaction.queryAsync('SELECT COUNT(*) FROM Users WHERE username = $1', [username])
    .then(({rows}) => {
      if (rows[0].count !== '0') {
        return next([409, 'A user with that username already exists.']);
      }

      bcrypt.genSaltAsync(12)
      .then((salt) => bcrypt.hashAsync(password, salt))
      .then((hash) => transaction.queryAsync('INSERT INTO Users (username, hash) values ($1, $2);', [username, hash]))
      .then(() => transaction.commitAsync())
      .then(() => res.json({ _rels, token: jwt.sign({ username }, jwtSecret) }));
    })
  );
  
}