import db from '../../database';

const requireAuth = (req, res, next) => {
  if (!req.username) {
    return next([401, 'Unauthorized.']);
  }

  next();
};

const getUser = (req, res, next) => {
  if (!req.username) {
    return next([401, 'Unauthorized.']);
  }

  db.queryAsync('SELECT * FROM Users where username = $1', [req.username])
  .then(({rows}) => {
    req.user = rows[0];
    console.log('got user');
    next();
  });
}

export default {
  requireAuth,
  getUser
};