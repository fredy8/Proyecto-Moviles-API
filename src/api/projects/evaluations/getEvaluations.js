import R from 'ramda';
import db from '../../../database';
import serverName from '../../serverName';
import distanceSort from '../../../utils/distanceSort';

export default (req, res, next) => {
  const projectId = req.params.id;

  let latitude = req.query.lat;
  let longitude = req.query.long;

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

      return transaction.queryAsync(`SELECT id, name, type, latitude, longitude FROM Evaluations WHERE projectId = $1`, [projectId])
    }).then(({rows}) => {
      rows.sort(distanceSort(latitude, longitude));
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