import R from 'ramda';
import db from '../../../database';
import validations from '../../../utils/validations';
import schema from './schema';

export default (req, res, next) => {
  const projectId = req.params.id;

  const { result, name, picture } = req.body;
  const type = validations.isNumber(req.body.type) ? req.body.type : parseInt(req.body.type, 10);
  const frequency = validations.isNumber(req.body.frequency) ? req.body.frequency : parseInt(req.body.frequency, 10);

  if (!validations.name(name) || !validations.isNumberInRange(0, R.toPairs(schema).length, type)) {
    return next([400, 'Invalid evaluation data.']);
  }

  console.log('nani');

  let buffer = null;
  if (picture) {
    try {
      buffer = new Buffer(picture, 'base64');
    } catch(e) {
      return next([400, 'picture must be a base64 encoded image.']);
    }
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

      return transaction.queryAsync(`INSERT INTO Evaluations (data, projectId, name, type, frequency, picture) VALUES ($1, $2, $3, $4, $5, $6);`, [result, projectId, name, type, frequency, buffer])
    }).then(() => transaction.commitAsync())
    .then(() => {
      res.status(204).send();
    });
  });
}