import R from 'ramda';
import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  console.log('huh');
  const projectId = req.params.id;
  db.queryAsync(`SELECT p.id as projectId, name, username, u.id as userId FROM (
      (SELECT projectId as id, userId FROM Collaborators WHERE userId = $1 AND projectId = $2
        UNION ALL
      SELECT id, ownerId as userId FROM Projects WHERE ownerId = $1 AND id = $2) as pIds
      JOIN Projects as p ON pIds.id = p.id JOIN Users as u on userId = u.id);`,
  [req.user.id, projectId])
  .then(({rows}) => {
    console.log(rows);
    if (!rows.length) {
      return next([404, 'Project not found']);
    }

    const name = rows[0].name;
    const id = rows[0].projectid;
    const mapRowToCollaboratorResourceUrl = (row) => `${serverName.api}project/${projectId}/collaborators/${row.userid}`;
    const mapRowToCollaboratorResource = (row) => ({
      username: row.username,
      _rels: {
        self: `${serverName.api}project/${projectId}/collaborators/${row.userid}`
      }
    });

    res.json({
      id,
      name,
      _rels: {
        self: `${serverName.api}projects/${projectId}`,
        collaborators: `${serverName.api}project/${projectId}/collaborators`
      },
      _embedded: {
        collaborators: {
          total: rows.length,
          _rels: R.merge(rows.map(mapRowToCollaboratorResourceUrl), {
            self: `${serverName.api}project/${projectId}/collaborators`
          }),
          _embedded: R.merge(rows.map(mapRowToCollaboratorResource), {})
        }
      }
    });
  });
}