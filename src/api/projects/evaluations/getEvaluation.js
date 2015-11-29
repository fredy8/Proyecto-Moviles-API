import R from 'ramda';
import db from '../../../database';
import serverName from '../../serverName';

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
        return next([404, 'Project not found']);
      }

      return transaction.queryAsync(`SELECT id, name, type, data, frequency, picture FROM Evaluations WHERE projectId = $1 AND id = $2`, [projectId, evaluationId])
    }).then(({rows}) => {
      if (rows.length == 0) {
        return next([404, 'Evaluation not found.']);
      }

      const { name, type, data, frequency, picture } = rows[0];
      const id = rows[0].projectid;
      res.json({
        id,
        name,
        type,
        data,
        frequency,
        picture: picture.toString('base64'),
        _rels: {
          self: `${serverName.api}projects/${projectId}/evaluations/${evaluationId}`,
        }
      });      
    }).then(() => transaction.commitAsync());
  });
};