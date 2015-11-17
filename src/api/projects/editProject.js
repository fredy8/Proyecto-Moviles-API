import db from '../../database';
import validations from '../../utils/validations';

export default (req, res, next) => {
  const projectId = req.params.id;
  const { name } = req.body;

  if (!validations.projectName(name)) {
    return next([400, 'Invalid project name.']);
  }

  db.queryAsync('UPDATE Projects SET name = $1 WHERE id = $2 AND ownerId = $3', [name, projectId, req.user.id])
  .then(({rowCount}) => {
    if (rowCount == 0) {
      return next([404, `Project not found with id ${projectId} or project is not owned by the user.`]);
    }

    res.status(204).send();
  });
};