import R from 'ramda';
import db from '../../database';
import serverName from '../serverName';
import distanceSort from '../../utils/distanceSort';

export default (req, res, next) => {
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

  db.queryAsync(`
    SELECT id, name, latitude, longitude FROM Projects WHERE ownerId = $1 UNION ALL
    SELECT id, name, latitude, longitude FROM Collaborators JOIN Projects ON projectId = id WHERE userId = $1
    `, [req.user.id])
  .then((({rows}) => {
    rows.sort(distanceSort(latitude, longitude));

    const mapRowToResourceUrl = R.compose((id) => `${serverName.api}projects/${id}`, R.prop('id'));
    const mapRowToEmbeddedResource = (row) => R.merge(R.pick(['id', 'name'], row), ({
      _rels: {
        self: mapRowToResourceUrl(row)
      },
    }));

    res.json({
      total: rows.length,
      _rels: R.merge({ self: `${serverName.api}projects` }, rows.map(mapRowToResourceUrl)),
      _embedded: R.merge(rows.map(mapRowToEmbeddedResource), {})
    });
  }));
};