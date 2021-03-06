import express from 'express';
import login from './login';
import register from './register';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

Promise.promisifyAll(jwt);

const jwtSecret = 'kcge76nisbv5ksgv3sifvnwuccpm342vfw';
const router = express.Router();

router.use((req, res, next) => {
  const accessToken = req.headers['x-access-token'];
  if (!accessToken) {
    return next();
  }

  jwt.verifyAsync(accessToken, jwtSecret)
  .then(({ username }) => {
    req.username = username;
    next();
  }).catch(jwt.JsonWebTokenError, (err) => next([400, 'Invalid token.']));
});

router.post('/login', login);
router.post('/register', register);

export default router;
