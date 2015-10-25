import R from 'ramda';
import express from 'express';
import auth from './auth';
import errorHandlers from './errorHandlers';
import serverName from './serverName';

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  const root = {
    _rels: {
      self: serverName.api
    }
  };

  if (req.username) {
    root.user = { username: req.username };
  } else {
    root._rels.login = serverName.api + 'login';
    root._rels.register = serverName.api + 'register';
  }

  res.json(root);
});

router.use(...errorHandlers);

export default router;