import R from 'ramda';
import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  const projectId = req.params.id;
  db.queryAsync(`SELECT p.id as projectId, p.name, username, u.id as userId, isOwner, picture FROM (
      (SELECT projectId as id, userId, false as isOwner FROM Collaborators WHERE projectId = $1
        UNION ALL
      SELECT id, ownerId as userId, true as isOwner FROM Projects WHERE id = $1) as pIds
      JOIN Projects as p ON pIds.id = p.id JOIN Users as u on userId = u.id);`,
  [projectId])
  .then(({rows}) => {
    const userRows = rows.filter((row) => row.userid == req.user.id);
    if (!userRows.length) {
      return next([404, 'Project not found']);
    }

    const name = rows[0].name;
    const id = rows[0].projectid;
    const isOwner = userRows[0].isowner;
    const picture = userRows[0].picture;
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
      picture: picture && picture.toString('base64'),
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