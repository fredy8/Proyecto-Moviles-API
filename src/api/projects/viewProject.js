import R from 'ramda';
import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  const projectId = req.params.id;
  db.queryAsync(`SELECT p.id as projectId, p.name, username, u.id as userId, isOwner FROM (
      (SELECT projectId as id, userId, false as isOwner FROM Collaborators WHERE projectId = $2
        UNION ALL
      SELECT id, ownerId as userId, true as isOwner FROM Projects WHERE ownerId = $1 AND id = $2) as pIds
      JOIN Projects as p ON pIds.id = p.id JOIN Users as u on userId = u.id);`,
  [req.user.id, projectId])
  .then(({rows}) => {
    if (!rows.length) {
      return next([404, 'Project not found']);
    }

    const name = rows[0].name;
    const id = rows[0].projectid;
    const isOwner = rows[0].isowner;
    const mapRowToCollaboratorResourceUrl = (row) => `${serverName.api}profiles/${row.userid}`;
    const mapRowToCollaboratorResource = (row) => ({
      username: row.username,
      _rels: {
        self: `${serverName.api}profiles/${row.userid}`
      }
    });

    res.json({
      id,
      name,
      isOwner,
      _rels: {
        self: `${serverName.api}projects/${projectId}`,
        collaborators: `${serverName.api}projects/${projectId}/collaborators`,
        evaluations: `${serverName.api}projects/${projectId}/evaluations`
      },
      _embedded: {
        collaborators: {
          total: rows.length,
          _rels: R.merge(rows.map(mapRowToCollaboratorResourceUrl), {
            self: `${serverName.api}projects/${projectId}/collaborators`
          }),
          _embedded: R.merge(rows.map(mapRowToCollaboratorResource), {})
        }
      }
    });
  });
}