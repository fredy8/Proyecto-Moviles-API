import R from 'ramda';
import db from '../../../database';
import serverName from '../../serverName';

export default (req, res, next) => {
  const projectId = req.params.id;
  
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

      return transaction.queryAsync(`SELECT id, name, type FROM Evaluations WHERE projectId = $1`, [projectId])
    }).then(({rows}) => {
      const mapRowToResourceUrl = R.compose((id) => `${serverName.api}projects/${projectId}/evaluations/${id}`, R.prop('id'));
      const mapRowToEmbeddedResource = (row) => R.merge(row, ({
        _rels: {
          self: mapRowToResourceUrl(row)
        },
      }));

      res.json({
        total: rows.length,
        _rels: R.merge({ self: `${serverName.api}projects/${projectId}/evaluations` }, rows.map(mapRowToResourceUrl)),
        _embedded: R.merge(rows.map(mapRowToEmbeddedResource), {})
      });
    }).then(() => transaction.commitAsync());
  });
}