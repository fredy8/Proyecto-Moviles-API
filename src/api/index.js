import R from 'ramda';
import express from 'express';
import auth from './auth';
import projects from './projects';
import profiles from './profiles';
import errorHandlers from './errorHandlers';
import serverName from './serverName';
import db from '../database';

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  const root = {
    _rels: {
      self: serverName.api
    }
  };

  if (req.username) {
    root._rels.projects = serverName.api + 'projects';

    db.queryAsync('SELECT id, username, name FROM Users where username = $1', [req.username])
    .then(({rows}) => {
      root._rels.profile = serverName.api + `profiles/${rows[0].id}`;
      root._embedded = {
        profile: R.pick(['username', 'name'], rows[0])
      };
      res.json(root);
    });
  } else {
    root._rels.login = serverName.api + 'login';
    root._rels.register = serverName.api + 'register';
    res.json(root);
  }
  
});

router.use(projects);
router.use(profiles);
router.use(...errorHandlers);

export default router;