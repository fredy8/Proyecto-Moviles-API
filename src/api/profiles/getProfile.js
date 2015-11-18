import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  const userId = req.params.id;

  db.queryAsync('SELECT username, name, profilePicture FROM Users where id = $1', [userId])
  .then(({rows}) => {
    if (rows.length == 0) {
      return next([404, `User not found with id ${userId}`]);
    }

    const profilePicture = rows[0].profilepicture ? rows[0].profilepicture.toString('base64') : null;

    res.json({
      name: rows[0].name,
      username: rows[0].username,
      profilePicture,
      _rels: {
        self: `${serverName.api}users/${userId}`
      }
    });
  });
};