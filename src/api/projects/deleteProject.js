import db from '../../database';
import validations from '../../utils/validations';

export default (req, res, next) => {
  const projectId = req.params.id;

  db.queryAsync('DELETE FROM Projects WHERE id = $1 AND ownerId = $2', [projectId, req.user.id])
  .then(({rowCount}) => {
    if (rowCount == 0) {
      return next([404, `Project not found with id ${projectId} or projects is not owned by the user.`]);
    }

    res.status(204).send();
  });
};