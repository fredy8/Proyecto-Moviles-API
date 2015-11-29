import db from '../../../database';

export default (req, res, next) => {
  const projectId = req.params.projectId;
  const evaluationId = req.params.evaluationId;
  
  db.begin().then((transaction) => {
    transaction.queryAsync(`
      SELECT SUM(projectsCount) FROM 
        ((SELECT COUNT(*) as projectsCount FROM Projects WHERE ownerId = $1 AND id = $2)
        UNION
        (SELECT COUNT(*) as projectsCount FROM Collaborators WHERE userId = $1 AND projectId = $2)) as projectsCounts`, [req.user.id, projectId])
    .then(({rows}) => {
      if (rows[0].sum == '0') {
        return next([404, 'Project not found.']);
      }

      return transaction.queryAsync(`DELETE FROM Evaluations WHERE projectId = $1 AND id = $2`, [projectId, evaluationId])
    }).then(({rowCount}) => {
      if (rowCount == 0) {
        return next([404, 'Evaluation not found.']);
      }

      res.status(204).send();
    }).then(() => transaction.commitAsync());
  });
};