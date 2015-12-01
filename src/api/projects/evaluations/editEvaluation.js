import R from 'ramda';
import db from '../../../database';
import serverName from '../../serverName';
import validations from '../../../utils/validations';
import schema from './schema';

export default (req, res, next) => {
  const projectId = req.params.projectId;
  const evaluationId = req.params.evaluationId;

  const { result, name, picture } = req.body;
  const type = validations.isNumber(req.body.type) ? req.body.type : parseInt(req.body.type, 10);
  const frequency = validations.isNumber(req.body.frequency) ? req.body.frequency : parseInt(req.body.frequency, 10);

  if (!validations.name(name) || !validations.isNumberInRange(0, R.toPairs(schema).length, type)) {
    return next([400, 'Invalid evaluation data.']);
  }

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

      return transaction.queryAsync(`UPDATE Evaluations SET data=$1, name=$2, type=$3, frequency=$4, picture=$5 WHERE id = $6;`, [result, name, type, frequency, buffer, evaluationId])
    }).then(() => transaction.commitAsync()).then(() => {
      res.status(204).send();
    });
  });
};