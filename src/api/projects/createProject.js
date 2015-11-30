import db from '../../database';
import validations from '../../utils/validations';
import serverName from '../serverName';

export default (req, res, next) => {
  const { name, picture } = req.body;
  let { latitude, longitude } = req.body;

  if (typeof latitude !== 'undefined' || typeof longitude !== 'undefined') {
    try {
      if(typeof latitude === 'string') {
        latitude = parseFloat(latitude);
      }

      if(typeof longitude === 'string') {
        longitude = parseFloat(longitude);
      }

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return next([400, 'Invalid format for latitude or longitude.']);  
      }
    } catch (e) {
      return next([400, 'Invalid format for latitude or longitude.']);
    }
  } else {
    latitude = longitude = null;
  }

  if (!validations.projectName(name)) {
    return next([400, 'Invalid project name.']);
  }

  let buffer = null;
  if (picture) {
    try {
      buffer = new Buffer(picture, 'base64');
    } catch(e) {
      return next([400, 'picture must be a base64 encoded image.']);
    }
  }

  db.begin()
  .then((transaction) =>
    transaction.queryAsync('SELECT COUNT(*) FROM Projects WHERE name = $1;', [name])
    .then(({rows}) => {
      if (rows[0].count != '0') {
        return next([409, 'A project with that name already exists.']);
      }

      return transaction.queryAsync('INSERT INTO Projects (name, ownerId, picture, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id;', [name, req.user.id, buffer, latitude, longitude])
      .then(({rows}) => {
        transaction.commitAsync()
        .then(() => res.json({
          id: rows[0].id,
          _rels: {
            self: `${serverName.api}projects/${rows[0].id}`
          }
        }));
      });
    })
  );
};