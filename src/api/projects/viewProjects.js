import R from 'ramda';
import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  db.queryAsync(`
    SELECT id, name FROM Projects WHERE ownerId = $1 UNION ALL
    SELECT id, name FROM Collaborators JOIN Projects ON projectId = id WHERE userId = $1
    `, [req.user.id])
  .then((({rows}) => {
    const mapRowToResourceUrl = R.compose((id) => `${serverName.api}projects/${id}`, R.prop('id'));
    const mapRowToEmbeddedResource = (row) => R.merge(row, ({
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