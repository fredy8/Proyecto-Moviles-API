import db from '../../database';
import serverName from '../serverName';

export default (req, res, next) => {
  const userId = req.params.id;
  if (req.user.id != userId) {
    return next([401, `You do not have permission to edit the profile for the user with id ${userId}`]);
  }

  const { profilePicture } = req.body;

  let buffer = null;
  try {
    buffer = new Buffer(profilePicture, 'base64');
  } catch(e) {
    return next([400, `profilePicture must be a base64 encoded image.`]);
  }

  db.queryAsync('UPDATE Users SET profilePicture = $1 WHERE id = $2', [buffer, userId])
  .then(({rowCount}) => {
    res.status(204).send();
  });
};