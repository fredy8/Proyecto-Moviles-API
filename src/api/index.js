import R from 'ramda';
import express from 'express';
import auth from './auth';
import { getUser } from './auth/authorization';
import projects from './projects';
import profiles from './profiles';
import errorHandlers from './errorHandlers';
import serverName from './serverName';

const router = express.Router();

router.use(auth);

router.get('/', getUser, (req, res) => {
  const root = {
    _rels: {
      self: serverName.api
    }
  };

  if (req.username) {
    root._rels.profile = serverName.api + `profiles/${req.user.id}`;
    root._rels.projects = serverName.api + 'projects';
    
    root._embedded = {
      profile: R.pick(['username', 'name'], req.user)
    };
    
  } else {
    root._rels.login = serverName.api + 'login';
    root._rels.register = serverName.api + 'register';
  }

  res.json(root);
});

router.use(projects);
router.use(profiles);
router.use(...errorHandlers);

export default router;