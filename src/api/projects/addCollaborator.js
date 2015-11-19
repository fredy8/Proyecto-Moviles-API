import db from '../../database';
import validations from '../../utils/validations';
import serverName from '../serverName';

export default (req, res, next) => {
  const { collaborator } = req.body;
  const projectId = req.params.id;

  if (!validations.username(collaborator)) {
    return next([400, 'Invalid username.']);
  }

  db.begin()
  .then((transaction) => 
    transaction.queryAsync('SELECT COUNT(*) FROM Projects WHERE id = $1 AND ownerId = $2', [projectId, req.user.id])
    .then(({rows}) => {
      if (rows[0].count !== '1') {
        return next([404, 'Project not found. Make sure you are the owner of the project.']);
      }

      transaction.queryAsync('SELECT id FROM Users WHERE username = $1', [collaborator])
      .then(({rows}) => {
        if (rows.length == 0) {
          return next([404, 'Collaborator not found.']);
        }

        const collaboratorId = rows[0].id;

        transaction.queryAsync(
          `SELECT COUNT(*) FROM (
          SELECT projectId as id FROM Collaborators WHERE userId = $1 AND projectId = $2 UNION ALL
          SELECT id FROM Projects WHERE ownerId = $1 AND id = $2) as projects`, [collaboratorId, projectId])
        .then(({rows}) => {
          if (rows[0].count !== '0') {
            return next([409, 'The user is already a collaborator of the project.']);
          }

          transaction.queryAsync('INSERT INTO collaborators (userId, projectId) values ($1, $2)', [collaboratorId, projectId])
          .then(() => transaction.commitAsync())
          .then(() => {
            res.json({
              _rels: {
                self: `${serverName.api}profiles/${collaboratorId}`
              }
            });
          });
        });
      })
    })
  );
};