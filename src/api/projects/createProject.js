import db from '../../database';
import validations from '../../utils/validations';
import serverName from '../serverName';

export default (req, res, next) => {
  const { name } = req.body;

  if (!validations.projectName(name)) {
    return next([400, 'Invalid project name.']);
  }

  db.begin()
  .then((transaction) =>
    transaction.queryAsync('SELECT COUNT(*) FROM Projects WHERE name = $1;', [name])
    .then(({rows}) => {
      if (rows[0].count != '0') {
        return next([409, 'A project with that name already exists.']);
      }

      return transaction.queryAsync('INSERT INTO Projects (name, ownerId) VALUES ($1, $2) RETURNING id;', [name, req.user.id])
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